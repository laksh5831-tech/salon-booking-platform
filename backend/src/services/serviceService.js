const Service = require('../models/Service');
const AppError = require('../utils/AppError');
const salonService = require('./salonService');
const { paginate, paginationMeta } = require('../utils/pagination');

class ServiceService {
  async getServices(queryParams) {
    const { page, limit, category, salon, search, sort } = queryParams;

    let filter = { isActive: true };

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
      sortObj = { name: 1 };
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

  async getServiceById(id) {
    const service = await Service.findById(id)
      .populate('category', 'name slug')
      .populate('salon', 'name slug city');

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    return service;
  }

  async createService(salonId, serviceData, userId, userRole) {
    if (!(await salonService.isSalonAccessible(salonId, userId, userRole))) {
      throw new AppError('You are not authorized to add services to this salon', 403);
    }

    const service = await Service.create({
      ...serviceData,
      salon: salonId
    });

    return service;
  }

  async updateService(id, serviceData, userId, userRole) {
    const service = await Service.findById(id).populate('salon', 'owner managers');
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!(await salonService.isSalonAccessible(service.salon._id, userId, userRole))) {
      throw new AppError('You are not authorized to update this service', 403);
    }

    const updatedService = await Service.findByIdAndUpdate(id, serviceData, {
      new: true,
      runValidators: true
    });

    return updatedService;
  }

  async deleteService(id, userId, userRole) {
    const service = await Service.findById(id).populate('salon', 'owner managers');
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!(await salonService.isSalonAccessible(service.salon._id, userId, userRole))) {
      throw new AppError('You are not authorized to delete this service', 403);
    }

    service.isActive = false;
    await service.save();

    return service;
  }
}

module.exports = new ServiceService();
