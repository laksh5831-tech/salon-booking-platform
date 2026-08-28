const mongoose = require('mongoose');
const { DAYS_OF_WEEK } = require('../constants');

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: DAYS_OF_WEEK,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  start: {
    type: String,
    default: '09:00'
  },
  end: {
    type: String,
    default: '18:00'
  }
}, { _id: false });

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  profileImage: {
    type: String,
    default: null
  },
  specialization: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 0
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  workingHours: [workingHoursSchema],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

staffSchema.index({ salon: 1 });
staffSchema.index({ user: 1 });
staffSchema.index({ salon: 1, isAvailable: 1 });

staffSchema.virtual('leaves', {
  ref: 'StaffLeave',
  localField: '_id',
  foreignField: 'staff'
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
