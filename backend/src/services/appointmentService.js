const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const StaffLeave = require('../models/StaffLeave');
const AppError = require('../utils/AppError');
const { paginate, paginationMeta } = require('../utils/pagination');
const { doTimesOverlap } = require('../utils/timeUtils');
const notificationService = require('./notificationService');

class AppointmentService {
  async createAppointment(appointmentData, customerId) {
    const { salon, service, staff, date, startTime, notes } = appointmentData;

    const salonDoc = await Salon.findById(salon);
    if (!salonDoc || !salonDoc.isActive) {
      throw new AppError('Salon not found or inactive', 404);
    }

    const serviceDoc = await Service.findOne({ _id: service, salon, isActive: true });
    if (!serviceDoc) {
      throw new AppError('Service not found', 404);
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];

    const salonHours = salonDoc.openingHours.find(h => h.day === dayOfWeek);
    if (!salonHours || !salonHours.enabled) {
      throw new AppError('Salon is closed on the selected date', 400);
    }

    const endTime = this.calculateEndTime(startTime, serviceDoc.duration);

    let staffId = staff;
    let staffDoc;

    if (staffId) {
      staffDoc = await Staff.findOne({ _id: staffId, salon, isActive: true });
      if (!staffDoc) {
        throw new AppError('Staff member not found', 404);
      }

      const staffHours = staffDoc.workingHours.find(h => h.day === dayOfWeek);
      if (!staffHours || !staffHours.enabled) {
        throw new AppError('Staff member is not available on the selected date', 400);
      }

      const isOnLeave = await this.checkStaffLeave(staffId, appointmentDate);
      if (isOnLeave) {
        throw new AppError('Staff member is on leave for the selected date', 400);
      }

      const hasConflict = await this.checkDoubleBooking(staffId, appointmentDate, startTime, endTime);
      if (hasConflict) {
        throw new AppError('The selected time slot is no longer available due to an existing booking', 409);
      }
    } else {
      staffId = await this.autoAssignStaff(salon, serviceDoc._id, appointmentDate, startTime, endTime);
      staffDoc = await Staff.findById(staffId).select('name specialization');
    }

    const appointment = await Appointment.create({
      customer: customerId,
      salon,
      service,
      staff: staffId,
      date: appointmentDate,
      startTime,
      endTime,
      duration: serviceDoc.duration,
      price: serviceDoc.price,
      notes,
      status: 'pending'
    });

    await this.notifyNewBooking(appointment, salonDoc, serviceDoc, staffDoc, customerId);

    return appointment.populate([
      { path: 'salon', select: 'name slug address phone' },
      { path: 'service', select: 'name duration price' },
      { path: 'staff', select: 'name specialization' }
    ]);
  }

  async autoAssignStaff(salonId, serviceId, date, startTime, endTime) {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

    const candidates = await Staff.find({
      salon: salonId,
      isActive: true,
      isAvailable: true,
      services: serviceId
    });

    for (const candidate of candidates) {
      const hours = candidate.workingHours.find(h => h.day === dayOfWeek);
      if (!hours || !hours.enabled) continue;

      const startMinutes = this.timeToMinutes(startTime);
      const endMinutes = this.timeToMinutes(endTime);
      if (startMinutes < this.timeToMinutes(hours.start) || endMinutes > this.timeToMinutes(hours.end)) continue;

      if (await this.checkStaffLeave(candidate._id, date)) continue;

      if (await this.checkDoubleBooking(candidate._id, date, startTime, endTime)) continue;

      return candidate._id;
    }

    throw new AppError('No stylist is available for the selected time. Please choose another time or a specific stylist.', 409);
  }

  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async notifyNewBooking(appointment, salonDoc, serviceDoc, staffDoc, customerId) {
    try {
      const bookDate = appointment.date.toISOString().slice(0, 10);
      const message = `${serviceDoc.name} booked by a customer on ${bookDate} at ${appointment.startTime}`;

      if (salonDoc.owner) {
        await notificationService.create(
          salonDoc.owner,
          'New booking received',
          message,
          'booking',
          { appointmentId: appointment._id.toString(), salonId: salonDoc._id.toString() }
        );
      }
    } catch (error) {
      console.error('Failed to create booking notification:', error.message);
    }
  }

  async checkDoubleBooking(staffId, date, startTime, endTime) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      staff: staffId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    for (const existing of existingAppointments) {
      if (doTimesOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        return true;
      }
    }

    return false;
  }

  calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
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

  async findAccessibleSalon(userId, userRole) {
    if (userRole === 'admin') {
      return null;
    }

    return Salon.findOne({ $or: [{ owner: userId }, { managers: userId }] });
  }

  async getAppointments(userId, userRole, queryParams) {
    const { page, limit, status, salon, startDate, endDate, sort } = queryParams;

    let filter = {};

    if (userRole === 'customer') {
      filter.customer = userId;
    } else if (userRole === 'salon_owner' || userRole === 'salon_manager') {
      const salonDoc = await this.findAccessibleSalon(userId, userRole);
      if (salonDoc) {
        filter.salon = salonDoc._id;
      }
    } else if (userRole === 'staff') {
      const staffDoc = await Staff.findOne({ user: userId });
      if (staffDoc) {
        filter.staff = staffDoc._id;
      }
    }

    if (status) filter.status = status;
    if (salon) filter.salon = salon;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { date: -1, startTime: -1 };
    }

    const total = await Appointment.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Appointment.find(filter)
        .sort(sortObj)
        .populate('salon', 'name slug address phone')
        .populate('service', 'name duration price')
        .populate('staff', 'name specialization profileImage')
        .populate('customer', 'firstName lastName email phone'),
      page,
      limit
    );

    const appointments = await query;

    return {
      appointments,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async getAppointmentById(id, userId, userRole) {
    const appointment = await Appointment.findById(id)
      .populate('salon', 'name slug address phone email openingHours')
      .populate('service', 'name duration price description')
      .populate('staff', 'name specialization profileImage experience')
      .populate('customer', 'firstName lastName email phone');

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (userRole === 'customer' && appointment.customer._id.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to view this appointment', 403);
    }

    if (userRole === 'staff') {
      const staffDoc = await Staff.findOne({ user: userId });
      if (!staffDoc || appointment.staff._id.toString() !== staffDoc._id.toString()) {
        throw new AppError('You are not authorized to view this appointment', 403);
      }
    }

    return appointment;
  }

  async updateAppointment(id, updateData, userId, userRole) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (userRole === 'customer') {
      throw new AppError('Customers cannot update appointments directly', 403);
    }

    if (userRole === 'salon_owner' || userRole === 'salon_manager') {
      const salonDoc = await Salon.findOne({
        _id: appointment.salon,
        $or: [{ owner: userId }, { managers: userId }]
      });
      if (!salonDoc) {
        throw new AppError('You are not authorized to update this appointment', 403);
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'salon', select: 'name slug address phone' },
      { path: 'service', select: 'name duration price' },
      { path: 'staff', select: 'name specialization' },
      { path: 'customer', select: 'firstName lastName email phone' }
    ]);

    if (updateData.status && appointment.customer) {
      try {
        await notificationService.create(
          appointment.customer,
          'Appointment status updated',
          `Your appointment for ${appointment.service || 'your service'} is now ${updateData.status.replace('_', ' ')}.`,
          'status_update',
          { appointmentId: appointment._id.toString(), salonId: appointment.salon.toString() }
        );
      } catch (error) {
        console.error('Failed to create status notification:', error.message);
      }
    }

    return updatedAppointment;
  }

  async cancelAppointment(id, cancellationReason, userId, userRole) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (userRole === 'customer' && appointment.customer.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to cancel this appointment', 403);
    }

    if (userRole === 'staff') {
      const staffDoc = await Staff.findOne({ user: userId });
      if (!staffDoc || appointment.staff.toString() !== staffDoc._id.toString()) {
        throw new AppError('You are not authorized to cancel this appointment', 403);
      }
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw new AppError(`Cannot cancel appointment with status: ${appointment.status}`, 400);
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    try {
      const salonDoc = await Salon.findById(appointment.salon);
      if (salonDoc && salonDoc.owner) {
        const bookDate = appointment.date.toISOString().slice(0, 10);
        await notificationService.create(
          salonDoc.owner,
          'Appointment cancelled',
          `A booking for ${bookDate} at ${appointment.startTime} was cancelled by the customer.`,
          'cancellation',
          { appointmentId: appointment._id.toString(), salonId: appointment.salon.toString() }
        );
      }
    } catch (error) {
      console.error('Failed to create cancellation notification:', error.message);
    }

    return appointment.populate([
      { path: 'salon', select: 'name slug address phone' },
      { path: 'service', select: 'name duration price' },
      { path: 'staff', select: 'name specialization' },
      { path: 'customer', select: 'firstName lastName email phone' }
    ]);
  }

  async getSalonStats(salonId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalAppointments, todayAppointments, completedAppointments, cancelledAppointments, revenueResult] = await Promise.all([
      Appointment.countDocuments({ salon: salonId }),
      Appointment.countDocuments({ salon: salonId, date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ salon: salonId, status: 'completed' }),
      Appointment.countDocuments({ salon: salonId, status: 'cancelled' }),
      Appointment.aggregate([
        { $match: { salon: require('mongoose').Types.ObjectId.createFromHexString(salonId), status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    return {
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0
    };
  }
}

module.exports = new AppointmentService();
