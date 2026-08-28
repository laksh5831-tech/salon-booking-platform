const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-intent', protect, authorize('customer'), paymentController.createPaymentIntent);

router.post('/confirm', protect, paymentController.confirmPayment);

router.post('/:id/refund', protect, authorize('salon_owner', 'admin'), paymentController.refundPayment);

router.get('/my', protect, authorize('customer'), paymentController.getMyPayments);

router.get('/salon/:salonId', protect, authorize('salon_owner', 'salon_manager', 'admin'), paymentController.getSalonPayments);

router.get('/salon/:salonId/revenue', protect, authorize('salon_owner', 'admin'), paymentController.getSalonRevenue);

router.get('/:id', protect, paymentController.getPaymentById);

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
