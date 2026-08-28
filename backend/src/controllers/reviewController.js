const reviewService = require('../services/reviewService');
const { sendResponse } = require('../utils/response');

exports.getSalonReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getSalonReviews(req.params.salonId, req.query);
    sendResponse(res, 200, true, 'Reviews retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(
      req.params.salonId,
      req.body,
      req.user._id
    );
    sendResponse(res, 201, true, 'Review submitted successfully', review);
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Review updated successfully', review);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, true, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};
