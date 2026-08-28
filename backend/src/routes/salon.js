const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSalonSchema, updateSalonSchema } = require('../validators/salon');
const { createServiceSchema, updateServiceSchema } = require('../validators/service');
const { createStaffSchema, updateStaffSchema } = require('../validators/staff');
const { createStaffLeaveSchema, updateStaffLeaveSchema } = require('../validators/staffLeave');
const availabilityController = require('../controllers/availabilityController');

router.get('/', salonController.getSalons);
router.get('/my', protect, authorize('salon_owner', 'salon_manager', 'admin'), salonController.getMySalon);
router.get('/:id', salonController.getSalonById);
router.get('/slug/:slug', salonController.getSalonBySlug);

router.post(
  '/',
  protect,
  authorize('salon_owner', 'admin'),
  validate(createSalonSchema),
  salonController.createSalon
);

router.patch(
  '/:id',
  protect,
  authorize('salon_owner', 'admin'),
  validate(updateSalonSchema),
  salonController.updateSalon
);

router.delete(
  '/:id',
  protect,
  authorize('salon_owner', 'admin'),
  salonController.deleteSalon
);

router.get('/:salonId/services', salonController.getSalonServices);

router.post(
  '/:salonId/services',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  validate(createServiceSchema),
  serviceController.createService
);

router.get('/:salonId/staff', salonController.getSalonStaff);

router.post(
  '/:salonId/staff',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  validate(createStaffSchema),
  require('../controllers/staffController').createStaff
);

router.get(
  '/:salonId/availability',
  availabilityController.getSalonAvailability
);

router.post(
  '/:salonId/staff-leave',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  validate(createStaffLeaveSchema),
  require('../controllers/staffController').createStaffLeave
);

router.get(
  '/:salonId/staff-leave',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  require('../controllers/staffController').getStaffLeaves
);

router.get(
  '/:salonId/stats',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  require('../controllers/appointmentController').getSalonStats
);

module.exports = router;
