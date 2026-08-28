const Staff = require('../models/Staff');
const StaffLeave = require('../models/StaffLeave');
const Salon = require('../models/Salon');
const AppError = require('../utils/AppError');
const salonService = require('./salonService');
const { paginate, paginationMeta } = require('../utils/pagination');

class StaffService {
  async getStaffBySalon(salonId, queryParams) {
    const { page, limit, available } = queryParams;

    let filter = { salon: salonId, isActive: true };

    if (available === 'true') {
      filter.isAvailable = true;
    }

    const total = await Staff.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Staff.find(filter)
        .populate('services', 'name price duration')
        .populate('user', 'firstName lastName email phone avatar'),
      page,
      limit
    );

    const staff = await query;

    return {
      staff,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async getStaffById(id) {
    const staffMember = await Staff.findById(id)
      .populate('services', 'name price duration')
      .populate('salon', 'name slug')
      .populate('user', 'firstName lastName email phone avatar');

    if (!staffMember) {
      throw new AppError('Staff member not found', 404);
    }

    return staffMember;
  }

  async createStaff(salonId, staffData, userId, userRole) {
    const salon = await Salon.findById(salonId);
    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    if (!(await salonService.isSalonAccessible(salonId, userId, userRole))) {
      throw new AppError('You are not authorized to add staff to this salon', 403);
    }

    const staff = await Staff.create({
      ...staffData,
      salon: salonId
    });

    return staff;
  }

  async updateStaff(id, staffData, userId, userRole) {
    const staffMember = await Staff.findById(id).populate('salon', 'owner managers');
    if (!staffMember) {
      throw new AppError('Staff member not found', 404);
    }

    if (!(await salonService.isSalonAccessible(staffMember.salon._id, userId, userRole))) {
      throw new AppError('You are not authorized to update this staff member', 403);
    }

    const updatedStaff = await Staff.findByIdAndUpdate(id, staffData, {
      new: true,
      runValidators: true
    });

    return updatedStaff;
  }

  async deleteStaff(id, userId, userRole) {
    const staffMember = await Staff.findById(id).populate('salon', 'owner managers');
    if (!staffMember) {
      throw new AppError('Staff member not found', 404);
    }

    if (!(await salonService.isSalonAccessible(staffMember.salon._id, userId, userRole))) {
      throw new AppError('You are not authorized to delete this staff member', 403);
    }

    staffMember.isActive = false;
    await staffMember.save();

    return staffMember;
  }

  async createStaffLeave(salonId, leaveData, userId, userRole) {
    const salon = await Salon.findById(salonId);
    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    if (!(await salonService.isSalonAccessible(salonId, userId, userRole))) {
      throw new AppError('You are not authorized to manage staff leave', 403);
    }

    const staffMember = await Staff.findOne({ _id: leaveData.staff, salon: salonId });
    if (!staffMember) {
      throw new AppError('Staff member not found in this salon', 404);
    }

    const leave = await StaffLeave.create({
      ...leaveData,
      salon: salonId
    });

    return leave;
  }

  async getStaffLeaves(salonId, queryParams) {
    const { page, limit, staff, status } = queryParams;

    let filter = { salon: salonId };
    if (staff) filter.staff = staff;
    if (status) filter.status = status;

    const total = await StaffLeave.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      StaffLeave.find(filter)
        .sort({ startDate: -1 })
        .populate('staff', 'name'),
      page,
      limit
    );

    const leaves = await query;

    return {
      leaves,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async updateStaffLeave(id, leaveData, userId, userRole) {
    const leave = await StaffLeave.findById(id).populate('salon', 'owner managers');
    if (!leave) {
      throw new AppError('Staff leave not found', 404);
    }

    if (!(await salonService.isSalonAccessible(leave.salon._id, userId, userRole))) {
      throw new AppError('You are not authorized to update this leave', 403);
    }

    const updatedLeave = await StaffLeave.findByIdAndUpdate(id, leaveData, {
      new: true,
      runValidators: true
    });

    return updatedLeave;
  }
}

module.exports = new StaffService();
