const mongoose = require('mongoose');

const staffLeaveSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

staffLeaveSchema.index({ staff: 1 });
staffLeaveSchema.index({ salon: 1 });
staffLeaveSchema.index({ staff: 1, startDate: 1, endDate: 1 });

const StaffLeave = mongoose.model('StaffLeave', staffLeaveSchema);

module.exports = StaffLeave;
