const User = require('../models/User');
const Salon = require('../models/Salon');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Staff = require('../models/Staff');
const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');
const { paginate, paginationMeta } = require('../utils/pagination');

class AdminService {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomers,
      totalSalons,
      totalSalonOwners,
      totalStaff,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalServices,
      totalCategories,
      avgRatingResult
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Salon.countDocuments(),
      User.countDocuments({ role: 'salon_owner' }),
      Staff.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Service.countDocuments({ isActive: true }),
      ServiceCategory.countDocuments({ isActive: true }),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const platformRevenue = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    return {
      totalCustomers,
      totalSalons,
      totalSalonOwners,
      totalStaff,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalServices,
      totalCategories,
      averageRating: avgRatingResult.length > 0 ? Math.round(avgRatingResult[0].avgRating * 10) / 10 : 0,
      platformRevenue: platformRevenue.length > 0 ? platformRevenue[0].total : 0
    };
  }

  async getUsers(queryParams) {
    const { page, limit, search, role, sort, isActive } = queryParams;

    let filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await User.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      User.find(filter).sort(sortObj).select('-refreshTokens -refreshToken'),
      page,
      limit
    );

    const users = await query;

    return {
      users,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    }).select('-refreshTokens -refreshToken');

    return user;
  }

  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

  async getAllSalons(queryParams) {
    const { page, limit, search, city, isActive, sort } = queryParams;

    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (city) filter.city = new RegExp(city, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await Salon.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Salon.find(filter).sort(sortObj).populate('owner', 'firstName lastName email'),
      page,
      limit
    );

    const salons = await query;

    return {
      salons,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async toggleSalonStatus(salonId) {
    const salon = await Salon.findById(salonId);
    salon.isActive = !salon.isActive;
    await salon.save();
    return salon;
  }

  async getAllAppointments(queryParams) {
    const { page, limit, status, salon, sort } = queryParams;

    let filter = {};
    if (status) filter.status = status;
    if (salon) filter.salon = salon;

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await Appointment.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Appointment.find(filter)
        .sort(sortObj)
        .populate('salon', 'name slug')
        .populate('service', 'name')
        .populate('staff', 'name')
        .populate('customer', 'firstName lastName email'),
      page,
      limit
    );

    const appointments = await query;

    return {
      appointments,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async getAllReviews(queryParams) {
    const { page, limit, salon, sort, isApproved } = queryParams;

    let filter = {};
    if (salon) filter.salon = salon;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await Review.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Review.find(filter)
        .sort(sortObj)
        .populate('salon', 'name slug')
        .populate('customer', 'firstName lastName email')
        .populate('appointment'),
      page,
      limit
    );

    const reviews = await query;

    return {
      reviews,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async moderateReview(reviewId, isApproved) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved },
      { new: true }
    ).populate('customer', 'firstName lastName email')
      .populate('salon', 'name slug');

    return review;
  }

  async getServices(queryParams) {
    const { page, limit, search, category, salon, isActive, sort } = queryParams;

    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (category) filter.category = category;
    if (salon) filter.salon = salon;
    if (search) {
      filter.name = new RegExp(search, 'i');
    }

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await Service.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Service.find(filter)
        .sort(sortObj)
        .populate('category', 'name slug')
        .populate('salon', 'name slug city'),
      page,
      limit
    );

    const services = await query;

    return {
      services,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async toggleServiceStatus(serviceId) {
    const service = await Service.findById(serviceId);
    service.isActive = !service.isActive;
    await service.save();
    return service;
  }

  async getAllCategories(queryParams) {
    const { page, limit, search, sort } = queryParams;

    let filter = {};
    if (search) filter.name = new RegExp(search, 'i');

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { name: 1 };
    }

    const total = await ServiceCategory.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      ServiceCategory.find(filter).sort(sortObj),
      page,
      limit
    );

    const categories = await query;

    return {
      categories,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }
}

module.exports = new AdminService();
