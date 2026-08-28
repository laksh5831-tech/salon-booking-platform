const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewSchema, updateReviewSchema } = require('../validators/review');

router.get('/salon/:salonId', reviewController.getSalonReviews);

router.post(
  '/salon/:salonId',
  protect,
  authorize('customer'),
  validate(createReviewSchema),
  reviewController.createReview
);

router.patch(
  '/:id',
  protect,
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete(
  '/:id',
  protect,
  reviewController.deleteReview
);

module.exports = router;
