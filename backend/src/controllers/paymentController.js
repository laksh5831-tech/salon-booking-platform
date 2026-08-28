const paymentService = require('../services/paymentService');
const { sendResponse } = require('../utils/response');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const result = await paymentService.createPaymentIntent(
      req.body.appointmentId,
      req.user._id
    );
    sendResponse(res, 200, true, 'Payment intent created', result);
  } catch (error) {
    next(error);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.confirmPayment(req.body.paymentIntentId);
    sendResponse(res, 200, true, 'Payment confirmed', payment);
  } catch (error) {
    next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const payment = await paymentService.refundPayment(
      req.params.id,
      amount,
      reason,
      req.user._id
    );
    sendResponse(res, 200, true, 'Refund processed', payment);
  } catch (error) {
    next(error);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentsByCustomer(req.user._id, req.query);
    sendResponse(res, 200, true, 'Payments retrieved', result);
  } catch (error) {
    next(error);
  }
};

exports.getSalonPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentsBySalon(req.params.salonId, req.query);
    sendResponse(res, 200, true, 'Payments retrieved', result);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user._id);
    sendResponse(res, 200, true, 'Payment retrieved', payment);
  } catch (error) {
    next(error);
  }
};

exports.getSalonRevenue = async (req, res, next) => {
  try {
    const revenue = await paymentService.getSalonRevenue(
      req.params.salonId,
      req.query.period
    );
    sendResponse(res, 200, true, 'Revenue retrieved', revenue);
  } catch (error) {
    next(error);
  }
};

exports.webhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await paymentService.confirmPayment(paymentIntent.id);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const Payment = require('../models/Payment');
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'failed' }
    );
  }

  res.json({ received: true });
};
