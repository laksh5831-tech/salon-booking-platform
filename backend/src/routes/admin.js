const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/salons', adminController.getAllSalons);
router.patch('/salons/:id/toggle-status', adminController.toggleSalonStatus);
router.get('/appointments', adminController.getAllAppointments);
router.get('/reviews', adminController.getAllReviews);
router.patch('/reviews/:id/moderate', adminController.moderateReview);
router.get('/services', adminController.getAllServices);
router.patch('/services/:id/toggle-status', adminController.toggleServiceStatus);
router.get('/categories', adminController.getAllCategories);

module.exports = router;
