const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const AppError = require('../utils/AppError');

const isSandboxMode = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  return !key || key === 'sk_test_placeholder' || !key.startsWith('sk_');
};

const markAppointmentPaid = async (appointmentId, currentStatus) => {
  await Appointment.findByIdAndUpdate(appointmentId, {
    paymentStatus: 'paid',
    ...(currentStatus === 'pending' ? { status: 'confirmed' } : {})
  });
};

class PaymentService {
  async createPaymentIntent(appointmentId, customerId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('salon', 'name')
      .populate('service', 'name');

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.customer.toString() !== String(customerId)) {
      throw new AppError('Not authorized', 403);
    }

    const existingPayment = await Payment.findOne({
      appointment: appointmentId,
      status: { $in: ['pending', 'succeeded'] }
    });

    if (existingPayment && existingPayment.status === 'succeeded') {
      throw new AppError('Appointment already paid', 400);
    }

    const amountInCents = Math.round(appointment.price * 100);

    let paymentIntent;
    if (isSandboxMode()) {
      paymentIntent = {
        id: `pi_sandbox_${new mongoose.Types.ObjectId().toString()}`,
        client_secret: null
      };
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'inr',
        metadata: {
          appointmentId: appointment._id.toString(),
          customerId,
          salonId: appointment.salon._id.toString(),
          salonName: appointment.salon.name,
          service: appointment.service?.name || 'Salon Service'
        },
        automatic_payment_methods: { enabled: true }
      });
    }

    let payment;
    if (existingPayment) {
      payment = await Payment.findByIdAndUpdate(existingPayment._id, {
        stripePaymentIntentId: paymentIntent.id,
        amount: appointment.price,
        status: 'pending'
      }, { new: true });
    } else {
      payment = await Payment.create({
        appointment: appointmentId,
        customer: customerId,
        salon: appointment.salon._id,
        stripePaymentIntentId: paymentIntent.id,
        amount: appointment.price,
        status: 'pending',
        method: 'card'
      });
    }

    return {
      clientSecret: paymentIntent.client_secret || paymentIntent.id,
      paymentId: payment._id,
      amount: appointment.price
    };
  }

  async confirmPayment(paymentIntentId) {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('appointment');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.stripePaymentIntentId?.startsWith('pi_sandbox_')) {
      payment.status = 'succeeded';
      payment.stripeChargeId = `ch_sandbox_${new mongoose.Types.ObjectId().toString()}`;
      payment.cardLast4 = '4242';
      payment.cardBrand = 'visa';
      payment.receiptUrl = null;
      await payment.save();

      await markAppointmentPaid(payment.appointment._id, payment.appointment.status);

      return payment;
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      const charge = intent.charges?.data?.[0];

      payment.status = 'succeeded';
      payment.stripeChargeId = charge?.id;
      payment.cardLast4 = charge?.payment_method_details?.card?.last4;
      payment.cardBrand = charge?.payment_method_details?.card?.brand;
      payment.receiptUrl = charge?.receipt_url;
      await payment.save();

      await markAppointmentPaid(payment.appointment._id, payment.appointment.status);

      return payment;
    }

    return payment;
  }

  async refundPayment(paymentId, amount, reason, userId) {
    const payment = await Payment.findById(paymentId).populate('appointment');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'succeeded') {
      throw new AppError('Can only refund successful payments', 400);
    }

    const refundAmount = amount || (payment.amount - payment.refundAmount);
    const refundAmountCents = Math.round(refundAmount * 100);

    let refund;
    if (isSandboxMode() || payment.stripePaymentIntentId?.startsWith('pi_sandbox_')) {
      refund = { id: `re_sandbox_${new mongoose.Types.ObjectId().toString()}` };
    } else {
      refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmountCents,
        reason: 'requested_by_customer'
      });
    }

    payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
    payment.refundReason = reason || 'Customer requested refund';

    if (payment.refundAmount >= payment.amount) {
      payment.status = 'refunded';
      await Appointment.findByIdAndUpdate(payment.appointment._id, {
        paymentStatus: 'refunded'
      });
    } else {
      payment.status = 'partially_refunded';
    }

    await payment.save();
    return payment;
  }

  async getPaymentsByCustomer(customerId, queryParams) {
    const { page = 1, limit = 20 } = queryParams;

    const filter = { customer: customerId };

    const total = await Payment.countDocuments(filter);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await Payment.find(filter)
      .populate('appointment', 'date startTime service status')
      .populate('salon', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getPaymentsBySalon(salonId, queryParams) {
    const { page = 1, limit = 20, status, from, to } = queryParams;

    const filter = { salon: salonId };

    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const total = await Payment.countDocuments(filter);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await Payment.find(filter)
      .populate('appointment', 'date startTime service')
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getPaymentById(paymentId, userId) {
    const payment = await Payment.findById(paymentId)
      .populate('appointment')
      .populate('customer', 'firstName lastName email')
      .populate('salon', 'name city phone');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  async getSalonRevenue(salonId, period = 'month') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const result = await Payment.aggregate([
      {
        $match: {
          salon: new mongoose.Types.ObjectId(salonId),
          status: 'succeeded',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgTransaction: { $avg: '$amount' }
        }
      }
    ]);

    return result[0] || { totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 };
  }
}

module.exports = new PaymentService();
