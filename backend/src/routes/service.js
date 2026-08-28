const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateServiceSchema } = require('../validators/service');

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

router.patch(
  '/:id',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  validate(updateServiceSchema),
  serviceController.updateService
);

router.delete(
  '/:id',
  protect,
  authorize('salon_owner', 'salon_manager', 'admin'),
  serviceController.deleteService
);

module.exports = router;
