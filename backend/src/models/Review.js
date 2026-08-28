const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ salon: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ appointment: 1 });
reviewSchema.index({ salon: 1, isApproved: 1 });

reviewSchema.index({ salon: 1, customer: 1, appointment: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
