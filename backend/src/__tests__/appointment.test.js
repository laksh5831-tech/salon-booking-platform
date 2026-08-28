const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Appointment = require('../models/Appointment');
const { ROLES } = require('../constants');

let customerToken, ownerToken;
let testSalon, testService, testStaff, testCustomer;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/velora_test';
  await mongoose.connect(mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Salon.deleteMany({}),
    Service.deleteMany({}),
    Staff.deleteMany({}),
    Appointment.deleteMany({})
  ]);

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  testCustomer = await User.create({
    firstName: 'Test',
    lastName: 'Customer',
    email: 'testcustomer@test.com',
    password: hashedPassword,
    role: ROLES.CUSTOMER,
    isActive: true
  });

  const owner = await User.create({
    firstName: 'Test',
    lastName: 'Owner',
    email: 'testowner@test.com',
    password: hashedPassword,
    role: ROLES.SALON_OWNER,
    isActive: true
  });

  const customerLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'testcustomer@test.com', password: 'Password123!' });
  customerToken = customerLogin.body.data.accessToken;

  const ownerLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'testowner@test.com', password: 'Password123!' });
  ownerToken = ownerLogin.body.data.accessToken;

  testSalon = await Salon.create({
    name: 'Test Salon',
    description: 'A test salon',
    address: '123 Test Street',
    city: 'Test City',
    phone: '+1-555-0000',
    owner: owner._id,
    openingHours: [
      { day: 'monday', enabled: true, open: '09:00', close: '18:00' },
      { day: 'tuesday', enabled: true, open: '09:00', close: '18:00' },
      { day: 'wednesday', enabled: true, open: '09:00', close: '18:00' },
      { day: 'thursday', enabled: true, open: '09:00', close: '18:00' },
      { day: 'friday', enabled: true, open: '09:00', close: '18:00' },
      { day: 'saturday', enabled: false, open: '09:00', close: '18:00' },
      { day: 'sunday', enabled: false, open: '10:00', close: '16:00' }
    ]
  });

  testService = await Service.create({
    salon: testSalon._id,
    category: new mongoose.Types.ObjectId(),
    name: 'Test Service',
    description: 'A test service',
    price: 50,
    duration: 60,
    isActive: true
  });

  testStaff = await Staff.create({
    salon: testSalon._id,
    name: 'Test Staff',
    specialization: 'Test',
    experience: 5,
    services: [testService._id],
    workingHours: [
      { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
      { day: 'friday', enabled: true, start: '09:00', end: '18:00' }
    ],
    isAvailable: true
  });
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({}),
    Salon.deleteMany({}),
    Service.deleteMany({}),
    Staff.deleteMany({}),
    Appointment.deleteMany({})
  ]);
  await mongoose.connection.close();
});

describe('Appointment Endpoints', () => {
  describe('POST /api/v1/appointments', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    it('should create a new appointment', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          salon: testSalon._id.toString(),
          service: testService._id.toString(),
          staff: testStaff._id.toString(),
          date: tomorrow.toISOString(),
          startTime: '10:00'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
    });

    it('should prevent double booking (overlapping time)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          salon: testSalon._id.toString(),
          service: testService._id.toString(),
          staff: testStaff._id.toString(),
          date: tomorrow.toISOString(),
          startTime: '10:30'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('no longer available');
    });

    it('should prevent double booking (fully contained)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          salon: testSalon._id.toString(),
          service: testService._id.toString(),
          staff: testStaff._id.toString(),
          date: tomorrow.toISOString(),
          startTime: '10:15'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should prevent double booking (extending beyond)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          salon: testSalon._id.toString(),
          service: testService._id.toString(),
          staff: testStaff._id.toString,
          date: tomorrow.toISOString(),
          startTime: '09:30'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should allow non-overlapping appointment', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          salon: testSalon._id.toString(),
          service: testService._id.toString(),
          staff: testStaff._id.toString(),
          date: tomorrow.toISOString(),
          startTime: '11:00'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should not allow customer to create appointment without auth', async () => {
      const res = await request(app)
        .post('/api/v1/appointments')
        .send({
          salon: testSalon._id.toString(),
          service: testService._id.toString(),
          staff: testStaff._id.toString(),
          date: tomorrow.toISOString(),
          startTime: '14:00'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/appointments', () => {
    it('should get customer appointments', async () => {
      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.appointments)).toBe(true);
    });
  });

  describe('POST /api/v1/appointments/:id/cancel', () => {
    it('should cancel an appointment', async () => {
      const appointmentsRes = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${customerToken}`);

      const appointmentId = appointmentsRes.body.data.appointments[0]._id;

      const res = await request(app)
        .post(`/api/v1/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ cancellationReason: 'Schedule conflict' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });
  });
});
