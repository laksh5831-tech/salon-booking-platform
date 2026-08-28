const mongoose = require('mongoose');
const { DAYS_OF_WEEK } = require('../constants');

const openingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: DAYS_OF_WEEK,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  open: {
    type: String,
    default: '09:00'
  },
  close: {
    type: String,
    default: '18:00'
  },
  hasBreak: {
    type: Boolean,
    default: false
  },
  breakStart: {
    type: String,
    default: '13:00'
  },
  breakEnd: {
    type: String,
    default: '14:00'
  }
}, { _id: false });

const salonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Salon name is required'],
    trim: true,
    maxlength: [100, 'Salon name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'US',
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }],
  openingHours: [openingHoursSchema],
  bufferTime: {
    type: Number,
    default: 15,
    min: [0, 'Buffer time cannot be negative']
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

salonSchema.index({ city: 1 });
salonSchema.index({ owner: 1 });
salonSchema.index({ isActive: 1 });
salonSchema.index({ rating: -1 });

salonSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

salonSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'salon'
});

salonSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'salon'
});

const Salon = mongoose.model('Salon', salonSchema);

module.exports = Salon;
