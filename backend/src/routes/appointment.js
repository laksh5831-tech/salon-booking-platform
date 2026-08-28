const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema
} = require('../validators/appointment');

router.post(
  '/',
  protect,
  authorize('customer'),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

router.get('/', protect, appointmentController.getAppointments);
router.get('/:id', protect, appointmentController.getAppointmentById);

router.patch(
  '/:id',
  protect,
  authorize('salon_owner', 'salon_manager', 'staff', 'admin'),
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

router.post(
  '/:id/cancel',
  protect,
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

module.exports = router;
