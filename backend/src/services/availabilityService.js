const Salon = require('../models/Salon');
const Staff = require('../models/Staff');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const StaffLeave = require('../models/StaffLeave');
const AppError = require('../utils/AppError');
const { timeToMinutes, minutesToTime, generateTimeSlots, doTimesOverlap } = require('../utils/timeUtils');

class AvailabilityService {
  async getSalonAvailability(salonId, serviceId, staffId, date) {
    const salon = await Salon.findById(salonId);
    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];

    const salonHours = salon.openingHours.find(h => h.day === dayOfWeek);
    if (!salonHours || !salonHours.enabled) {
      return { availableSlots: [], message: 'Salon is closed on this day' };
    }

    let staffMembers;
    if (staffId) {
      const staffMember = await Staff.findOne({ _id: staffId, salon: salonId, isActive: true });
      if (!staffMember) {
        throw new AppError('Staff member not found', 404);
      }
      staffMembers = [staffMember];
    } else {
      staffMembers = await Staff.find({
        salon: salonId,
        services: serviceId,
        isActive: true,
        isAvailable: true
      });
    }

    if (staffMembers.length === 0) {
      return { availableSlots: [], message: 'No staff available for this service' };
    }

    const allAvailableSlots = [];

    for (const staffMember of staffMembers) {
      const staffHours = staffMember.workingHours.find(h => h.day === dayOfWeek);
      if (!staffHours || !staffHours.enabled) {
        continue;
      }

      const effectiveOpen = this.getLatestTime(salonHours.open, staffHours.start);
      const effectiveClose = this.getEarliestTime(salonHours.close, staffHours.end);

      if (timeToMinutes(effectiveOpen) >= timeToMinutes(effectiveClose)) {
        continue;
      }

      const isOnLeave = await this.checkStaffLeave(staffMember._id, appointmentDate);
      if (isOnLeave) {
        continue;
      }

      const existingAppointments = await this.getExistingAppointments(
        staffMember._id,
        appointmentDate
      );

      const staffSlots = this.calculateAvailableSlots(
        effectiveOpen,
        effectiveClose,
        service.duration,
        existingAppointments,
        salonHours,
        appointmentDate
      );

      for (const slot of staffSlots) {
        const existing = allAvailableSlots.find(
          s => s.startTime === slot.startTime && s.endTime === slot.endTime
        );

        if (existing) {
          existing.staff.push({
            _id: staffMember._id,
            name: staffMember.name,
            profileImage: staffMember.profileImage,
            specialization: staffMember.specialization,
            experience: staffMember.experience
          });
        } else {
          allAvailableSlots.push({
            ...slot,
            staff: [{
              _id: staffMember._id,
              name: staffMember.name,
              profileImage: staffMember.profileImage,
              specialization: staffMember.specialization,
              experience: staffMember.experience
            }]
          });
        }
      }
    }

    allAvailableSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    return {
      availableSlots: allAvailableSlots,
      salon: {
        _id: salon._id,
        name: salon.name,
        bufferTime: salon.bufferTime
      },
      service: {
        _id: service._id,
        name: service.name,
        duration: service.duration,
        price: service.price
      }
    };
  }

  async getStaffAvailability(staffId, date) {
    const staffMember = await Staff.findById(staffId).populate('salon');
    if (!staffMember) {
      throw new AppError('Staff member not found', 404);
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];

    const staffHours = staffMember.workingHours.find(h => h.day === dayOfWeek);
    if (!staffHours || !staffHours.enabled) {
      return { availableSlots: [], message: 'Staff is not available on this day' };
    }

    const salonHours = staffMember.salon.openingHours.find(h => h.day === dayOfWeek);
    if (!salonHours || !salonHours.enabled) {
      return { availableSlots: [], message: 'Salon is closed on this day' };
    }

    const effectiveOpen = this.getLatestTime(salonHours.open, staffHours.start);
    const effectiveClose = this.getEarliestTime(salonHours.close, staffHours.end);

    const isOnLeave = await this.checkStaffLeave(staffId, appointmentDate);
    if (isOnLeave) {
      return { availableSlots: [], message: 'Staff is on leave' };
    }

    const existingAppointments = await this.getExistingAppointments(staffId, appointmentDate);

    const allSlots = generateTimeSlots(effectiveOpen, effectiveClose, 30, 30);
    const availableSlots = [];

    for (const slot of allSlots) {
      let isAvailable = true;

      for (const appointment of existingAppointments) {
        if (doTimesOverlap(slot.startTime, slot.endTime, appointment.startTime, appointment.endTime)) {
          isAvailable = false;
          break;
        }
      }

      if (salonHours.hasBreak) {
        if (doTimesOverlap(slot.startTime, slot.endTime, salonHours.breakStart, salonHours.breakEnd)) {
          isAvailable = false;
        }
      }

      if (isAvailable) {
        availableSlots.push(slot);
      }
    }

    return {
      availableSlots,
      staff: {
        _id: staffMember._id,
        name: staffMember.name,
        profileImage: staffMember.profileImage,
        specialization: staffMember.specialization,
        experience: staffMember.experience
      }
    };
  }

  calculateAvailableSlots(openTime, closeTime, duration, existingAppointments, salonHours, appointmentDate) {
    const allSlots = generateTimeSlots(openTime, closeTime, duration, 15);
    const availableSlots = [];

    const now = new Date();
    const isToday = appointmentDate.toDateString() === now.toDateString();

    for (const slot of allSlots) {
      if (isToday) {
        const slotStartMinutes = timeToMinutes(slot.startTime);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (slotStartMinutes <= currentMinutes) {
          continue;
        }
      }

      let isAvailable = true;

      for (const appointment of existingAppointments) {
        if (doTimesOverlap(slot.startTime, slot.endTime, appointment.startTime, appointment.endTime)) {
          isAvailable = false;
          break;
        }
      }

      if (salonHours.hasBreak) {
        if (doTimesOverlap(slot.startTime, slot.endTime, salonHours.breakStart, salonHours.breakEnd)) {
          isAvailable = false;
        }
      }

      if (isAvailable) {
        availableSlots.push(slot);
      }
    }

    return availableSlots;
  }

  async checkStaffLeave(staffId, date) {
    const leave = await StaffLeave.findOne({
      staff: staffId,
      status: 'approved',
      startDate: { $lte: date },
      endDate: { $gte: date }
    });

    return !!leave;
  }

  async getExistingAppointments(staffId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.find({
      staff: staffId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');
  }

  getLatestTime(time1, time2) {
    return timeToMinutes(time1) > timeToMinutes(time2) ? time1 : time2;
  }

  getEarliestTime(time1, time2) {
    return timeToMinutes(time1) < timeToMinutes(time2) ? time1 : time2;
  }
}

module.exports = new AvailabilityService();
