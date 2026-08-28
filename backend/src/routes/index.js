const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const salonRoutes = require('./salon');
const serviceRoutes = require('./service');
const staffRoutes = require('./staff');
const appointmentRoutes = require('./appointment');
const reviewRoutes = require('./review');
const categoryRoutes = require('./category');
const adminRoutes = require('./admin');
const paymentRoutes = require('./payment');
const notificationRoutes = require('./notification');

router.use('/auth', authRoutes);
router.use('/salons', salonRoutes);
router.use('/services', serviceRoutes);
router.use('/staff', staffRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
