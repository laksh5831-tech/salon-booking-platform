const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');
const Salon = require('../models/Salon');
const { ROLES } = require('../constants');

let ownerToken, otherOwnerToken, customerToken, adminToken;
let ownerSalon, otherSalon;

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/velora_test';
  await mongoose.connect(mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Salon.deleteMany({})
  ]);

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const owner1 = await User.create({
    firstName: 'Owner',
    lastName: 'One',
    email: 'owner1@test.com',
    password: hashedPassword,
    role: ROLES.SALON_OWNER,
    isActive: true
  });

  const owner2 = await User.create({
    firstName: 'Owner',
    lastName: 'Two',
    email: 'owner2@test.com',
    password: hashedPassword,
    role: ROLES.SALON_OWNER,
    isActive: true
  });

  const customer = await User.create({
    firstName: 'Customer',
    lastName: 'Test',
    email: 'saloncustomer@test.com',
    password: hashedPassword,
    role: ROLES.CUSTOMER,
    isActive: true
  });

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'Test',
    email: 'salonadmin@test.com',
    password: hashedPassword,
    role: ROLES.ADMIN,
    isActive: true
  });

  ownerSalon = await Salon.create({
    name: 'Owner 1 Salon',
    description: 'Test salon',
    address: '123 Main St',
    city: 'Test City',
    phone: '+1-555-0001',
    owner: owner1._id,
    openingHours: [
      { day: 'monday', enabled: true, open: '09:00', close: '18:00' }
    ]
  });

  otherSalon = await Salon.create({
    name: 'Owner 2 Salon',
    description: 'Another test salon',
    address: '456 Other St',
    city: 'Other City',
    phone: '+1-555-0002',
    owner: owner2._id,
    openingHours: [
      { day: 'monday', enabled: true, open: '09:00', close: '18:00' }
    ]
  });

  const login1 = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'owner1@test.com', password: 'Password123!' });
  ownerToken = login1.body.data.accessToken;

  const login2 = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'owner2@test.com', password: 'Password123!' });
  otherOwnerToken = login2.body.data.accessToken;

  const custLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'saloncustomer@test.com', password: 'Password123!' });
  customerToken = custLogin.body.data.accessToken;

  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'salonadmin@test.com', password: 'Password123!' });
  adminToken = adminLogin.body.data.accessToken;
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({}),
    Salon.deleteMany({})
  ]);
  await mongoose.connection.close();
});

describe('Salon Access Control', () => {
  it('should allow owner to update their own salon', async () => {
    const res = await request(app)
      .patch(`/api/v1/salons/${ownerSalon._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ description: 'Updated description' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny owner from updating another owner\'s salon', async () => {
    const res = await request(app)
      .patch(`/api/v1/salons/${ownerSalon._id}`)
      .set('Authorization', `Bearer ${otherOwnerToken}`)
      .send({ description: 'Hacked description' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should deny customer from updating any salon', async () => {
    const res = await request(app)
      .patch(`/api/v1/salons/${ownerSalon._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ description: 'Customer update' });

    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to update any salon', async () => {
    const res = await request(app)
      .patch(`/api/v1/salons/${ownerSalon._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Admin updated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should allow public access to view salons', async () => {
    const res = await request(app)
      .get('/api/v1/salons');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return salon by slug', async () => {
    const res = await request(app)
      .get(`/api/v1/salons/slug/${ownerSalon.slug}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Owner 1 Salon');
  });

  it('should deny owner from deleting another salon', async () => {
    const res = await request(app)
      .delete(`/api/v1/salons/${otherSalon._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should allow owner to soft-delete their own salon', async () => {
    const res = await request(app)
      .delete(`/api/v1/salons/${ownerSalon._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
