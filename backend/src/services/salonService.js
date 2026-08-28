const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const AppError = require('../utils/AppError');
const { paginate, paginationMeta } = require('../utils/pagination');
const generateSlug = require('../utils/slug');

class SalonService {
  async getSalons(queryParams) {
    const { page, limit, search, city, category, rating, sort, lat, lng, maxDistance } = queryParams;

    let filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (category) {
      filter.categories = category;
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (lat && lng && maxDistance) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(maxDistance) / 6378.1]
        }
      };
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
      Salon.find(filter).sort(sortObj).populate('categories', 'name slug'),
      page,
      limit
    );

    const salons = await query;

    return {
      salons,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async getSalonById(id) {
    const salon = await Salon.findById(id)
      .populate('categories', 'name slug')
      .populate('owner', 'firstName lastName email');

    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    return salon;
  }

  async getSalonBySlug(slug) {
    const salon = await Salon.findOne({ slug, isActive: true })
      .populate('categories', 'name slug')
      .populate('owner', 'firstName lastName email');

    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    return salon;
  }

  async getSalonForUser(userId, userRole) {
    if (!['salon_owner', 'salon_manager'].includes(userRole)) {
      return null;
    }

    return Salon.findOne({ $or: [{ owner: userId }, { managers: userId }] });
  }

  async isSalonAccessible(salonId, userId, userRole) {
    if (userRole === 'admin') {
      return true;
    }

    if (userRole === 'salon_owner' || userRole === 'salon_manager') {
      const salon = await Salon.findById(salonId).select('owner managers');
      if (!salon) {
        return false;
      }
      return salon.owner.toString() === userId.toString()
        || salon.managers.some((m) => m && m.toString() === userId.toString());
    }

    return false;
  }

  async getMySalon(userId, userRole) {
    const salon = await this.getSalonForUser(userId, userRole);
    if (!salon) {
      throw new AppError('No salon is associated with this account', 404);
    }

    const [staffCount, serviceCount] = await Promise.all([
      Staff.countDocuments({ salon: salon._id, isActive: true }),
      require('../models/Service').countDocuments({ salon: salon._id, isActive: true })
    ]);

    return {
      ...salon.toObject(),
      staffCount,
      serviceCount
    };
  }

  async createSalon(salonData, ownerId) {
    const existingSalon = await Salon.findOne({ name: salonData.name });
    if (existingSalon) {
      throw new AppError('A salon with this name already exists', 400);
    }

    const salon = await Salon.create({
      ...salonData,
      owner: ownerId,
      slug: generateSlug(salonData.name)
    });

    return salon;
  }

  async updateSalon(id, salonData, userId, userRole) {
    const salon = await Salon.findById(id);
    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    if (!(await this.isSalonAccessible(id, userId, userRole))) {
      throw new AppError('You are not authorized to update this salon', 403);
    }

    if (salonData.name && salonData.name !== salon.name) {
      salonData.slug = generateSlug(salonData.name);
    }

    const updatedSalon = await Salon.findByIdAndUpdate(id, salonData, {
      new: true,
      runValidators: true
    });

    return updatedSalon;
  }

  async deleteSalon(id, userId, userRole) {
    const salon = await Salon.findById(id);
    if (!salon) {
      throw new AppError('Salon not found', 404);
    }

    if (!(await this.isSalonAccessible(id, userId, userRole))) {
      throw new AppError('You are not authorized to delete this salon', 403);
    }

    salon.isActive = false;
    await salon.save();

    return salon;
  }

  async getSalonServices(salonId, queryParams) {
    const { page, limit, category, sort } = queryParams;

    let filter = { salon: salonId, isActive: true };
    if (category) {
      filter.category = category;
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
      Service.find(filter).sort(sortObj).populate('category', 'name slug'),
      page,
      limit
    );

    const services = await query;

    return {
      services,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async getSalonStaff(salonId, queryParams) {
    const { page, limit } = queryParams;

    const filter = { salon: salonId, isActive: true };

    const total = await Staff.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      Staff.find(filter).populate('services', 'name price duration'),
      page,
      limit
    );

    const staff = await query;

    return {
      staff,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }
}

module.exports = new SalonService();
