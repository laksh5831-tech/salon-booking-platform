const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const AppError = require('../utils/AppError');
const { paginate, paginationMeta } = require('../utils/pagination');

class ReviewService {
  async getSalonReviews(salonId, queryParams) {
    const { page, limit, sort } = queryParams;

    const filter = { salon: salonId, isApproved: true };

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
        .populate('customer', 'firstName lastName avatar'),
      page,
      limit
    );

    const reviews = await query;

    return {
      reviews,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async createReview(salonId, reviewData, customerId) {
    const appointment = await Appointment.findOne({
      _id: reviewData.appointment,
      customer: customerId,
      salon: salonId,
      status: 'completed'
    });

    if (!appointment) {
      throw new AppError('You can only review salons after completing an appointment', 400);
    }

    const existingReview = await Review.findOne({
      customer: customerId,
      appointment: reviewData.appointment
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this appointment', 400);
    }

    const review = await Review.create({
      ...reviewData,
      customer: customerId,
      salon: salonId
    });

    await this.updateSalonRating(salonId);

    return review.populate('customer', 'firstName lastName avatar');
  }

  async updateReview(id, reviewData, userId, userRole) {
    const review = await Review.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (userRole === 'customer' && review.customer.toString() !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    const updatedReview = await Review.findByIdAndUpdate(id, reviewData, {
      new: true,
      runValidators: true
    }).populate('customer', 'firstName lastName avatar');

    if (reviewData.rating) {
      await this.updateSalonRating(review.salon);
    }

    return updatedReview;
  }

  async deleteReview(id, userId, userRole) {
    const review = await Review.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (userRole === 'customer' && review.customer.toString() !== userId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    if (userRole !== 'admin' && userRole !== 'salon_owner') {
      if (review.customer.toString() !== userId) {
        throw new AppError('You are not authorized to delete this review', 403);
      }
    }

    await Review.findByIdAndDelete(id);
    await this.updateSalonRating(review.salon);

    return review;
  }

  async updateSalonRating(salonId) {
    const result = await Review.aggregate([
      { $match: { salon: require('mongoose').Types.ObjectId.createFromHexString(salonId), isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (result.length > 0) {
      await Salon.findByIdAndUpdate(salonId, {
        rating: Math.round(result[0].avgRating * 10) / 10,
        reviewCount: result[0].count
      });
    } else {
      await Salon.findByIdAndUpdate(salonId, {
        rating: 0,
        reviewCount: 0
      });
    }
  }
}

module.exports = new ReviewService();
