const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateStaffSchema } = require('../validators/staff');
const { updateStaffLeaveSchema } = require('../validators/staffLeave');

router.get('/:id', staffController.getStaffById);

router.get(
  '/:staffId/availability',
  require('../controllers/availabilityController').getStaffAvailability
);

router.patch(
  '/:id',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  validate(updateStaffSchema),
  staffController.updateStaff
);

router.delete(
  '/:id',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  staffController.deleteStaff
);

router.patch(
  '/leave/:id',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  validate(updateStaffLeaveSchema),
  staffController.updateStaffLeave
);

module.exports = router;
