const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Salon = require('../models/Salon');
const ServiceCategory = require('../models/ServiceCategory');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const StaffLeave = require('../models/StaffLeave');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/velora_salon';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Salon.deleteMany({}),
      ServiceCategory.deleteMany({}),
      Service.deleteMany({}),
      Staff.deleteMany({}),
      StaffLeave.deleteMany({}),
      Appointment.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const admin = await User.create({
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'admin@velora.demo',
      phone: '+91-98765-43210',
      password: 'Password123!',
      role: 'admin',
      isActive: true
    });

    const salonOwner = await User.create({
      firstName: 'Kavitha',
      lastName: 'Rajan',
      email: 'owner@velora.demo',
      phone: '+91-98401-23456',
      password: 'Password123!',
      role: 'salon_owner',
      isActive: true
    });

    const salonOwner2 = await User.create({
      firstName: 'Deepak',
      lastName: 'Nair',
      email: 'owner2@velora.demo',
      phone: '+91-94450-67890',
      password: 'Password123!',
      role: 'salon_owner',
      isActive: true
    });

    const salonOwner3 = await User.create({
      firstName: 'Vikram',
      lastName: 'Seth',
      email: 'owner3@velora.demo',
      phone: '+91-98200-54321',
      password: 'Password123!',
      role: 'salon_owner',
      isActive: true
    });

    const manager = await User.create({
      firstName: 'Anitha',
      lastName: 'Krishnan',
      email: 'manager@velora.demo',
      phone: '+91-97890-12345',
      password: 'Password123!',
      role: 'salon_manager',
      isActive: true
    });

    const staffUser1 = await User.create({
      firstName: 'Meena',
      lastName: 'Sundaram',
      email: 'staff@velora.demo',
      phone: '+91-98845-67890',
      password: 'Password123!',
      role: 'staff',
      isActive: true
    });

    const staffUser2 = await User.create({
      firstName: 'Arun',
      lastName: 'Prasad',
      email: 'staff2@velora.demo',
      phone: '+91-99400-12345',
      password: 'Password123!',
      role: 'staff',
      isActive: true
    });

    const customers = await User.insertMany([
      {
        firstName: 'Divya',
        lastName: 'Velan',
        email: 'customer@velora.demo',
        phone: '+91-98765-11111',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      },
      {
        firstName: 'Kavin',
        lastName: 'Kumar',
        email: 'kavin.k@email.com',
        phone: '+91-98765-22222',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      },
      {
        firstName: 'Lakshmi',
        lastName: 'Priya',
        email: 'lakshmi.p@email.com',
        phone: '+91-98765-33333',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      },
      {
        firstName: 'Karthik',
        lastName: 'Raja',
        email: 'karthik.r@email.com',
        phone: '+91-98765-44444',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      },
      {
        firstName: 'Swathi',
        lastName: 'Murugan',
        email: 'swathi.m@email.com',
        phone: '+91-98765-55555',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      }
    ]);

    console.log('Users seeded');

    const categories = await ServiceCategory.insertMany([
      { name: 'Hair', slug: 'hair', description: 'Hair cutting, styling and treatments' },
      { name: 'Hair Color', slug: 'hair-color', description: 'Hair coloring and highlights' },
      { name: 'Facial', slug: 'facial', description: 'Facial treatments and skincare' },
      { name: 'Nails', slug: 'nails', description: 'Manicure, pedicure and nail art' },
      { name: 'Makeup', slug: 'makeup', description: 'Professional makeup services' },
      { name: 'Spa', slug: 'spa', description: 'Relaxing spa treatments' },
      { name: 'Grooming', slug: 'grooming', description: 'Men grooming services' }
    ]);

    console.log('Categories seeded');

    const defaultOpeningHours = [
      { day: 'monday', enabled: true, open: '09:00', close: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
      { day: 'tuesday', enabled: true, open: '09:00', close: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
      { day: 'wednesday', enabled: true, open: '09:00', close: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
      { day: 'thursday', enabled: true, open: '09:00', close: '20:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
      { day: 'friday', enabled: true, open: '09:00', close: '20:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
      { day: 'saturday', enabled: true, open: '09:00', close: '18:00', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
      { day: 'sunday', enabled: false, open: '10:00', close: '16:00', hasBreak: false, breakStart: '13:00', breakEnd: '14:00' }
    ];

    const salons = await Salon.insertMany([
      {
        name: 'Anu Beauty Studio',
        slug: 'anu-beauty-studio',
        coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&fit=crop&crop=faces',
        description: 'A premium hair and beauty salon in the heart of Chennai offering world-class services in a sophisticated environment.',
        address: '12, Anna Salai, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '600017',
        latitude: 13.0403,
        longitude: 80.2335,
        phone: '+91-44-2434-5678',
        email: 'hello@anubeauty.demo',
        website: 'https://anubeauty.demo',
        owner: salonOwner._id,
        categories: [categories[0]._id, categories[1]._id, categories[4]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 15,
        rating: 4.8,
        reviewCount: 124
      },
      {
        name: 'Serenity Spa & Wellness',
        slug: 'serenity-spa-wellness',
        coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop&crop=faces',
        description: 'An oasis of tranquility in Coimbatore offering holistic spa treatments and advanced beauty services.',
        address: '45, Race Course Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '641018',
        latitude: 11.0168,
        longitude: 76.9558,
        phone: '+91-422-4567-890',
        email: 'info@serenityspa.demo',
        website: 'https://serenityspa.demo',
        owner: salonOwner._id,
        categories: [categories[0]._id, categories[2]._id, categories[5]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 20,
        rating: 4.9,
        reviewCount: 89
      },
      {
        name: 'Kaveri Hair Studio',
        slug: 'kaveri-hair-studio',
        coverImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&crop=faces',
        description: 'Specializing in creative hair color, balayage, and modern styling techniques in Madurai.',
        address: '78, North Masi Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '625001',
        latitude: 9.9252,
        longitude: 78.1198,
        phone: '+91-452-2345-678',
        email: 'color@kaverihair.demo',
        website: 'https://kaverihair.demo',
        owner: salonOwner2._id,
        categories: [categories[0]._id, categories[1]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 15,
        rating: 4.7,
        reviewCount: 67
      },
      {
        name: 'Lakshmi Nail Art Studio',
        slug: 'lakshmi-nail-art',
        coverImage: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=200&fit=crop&crop=faces',
        description: 'Artistic nail designs and premium manicure and pedicure services in Trichy.',
        address: '23, Chinna Kadai Street',
        city: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '620002',
        latitude: 10.7905,
        longitude: 78.7047,
        phone: '+91-431-6543-210',
        email: 'nails@lakshminails.demo',
        website: 'https://lakshminails.demo',
        owner: salonOwner._id,
        categories: [categories[3]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 10,
        rating: 4.6,
        reviewCount: 45
      },
      {
        name: 'Velan Men\'s Grooming',
        slug: 'velan-mens-grooming',
        coverImage: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop&crop=faces',
        description: 'A modern grooming lounge for the distinguished gentleman. Classic cuts, hot towel shaves, and premium grooming products.',
        address: '123, Sowripalayam Main Road',
        city: 'Salem',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '636002',
        latitude: 11.6643,
        longitude: 78.146,
        phone: '+91-427-9876-543',
        email: 'hello@velangrooming.demo',
        website: 'https://velangrooming.demo',
        owner: salonOwner2._id,
        categories: [categories[0]._id, categories[6]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 15,
        rating: 4.5,
        reviewCount: 38
      },
      {
        name: 'Rose Petal Beauty Studio',
        slug: 'rose-petal-beauty-studio',
        coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop&crop=faces',
        description: 'A charming beauty parlour in Vellore trusted by families for generations.',
        address: '8/2, Vallalar Salai',
        city: 'Vellore',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '632004',
        latitude: 12.9165,
        longitude: 79.1325,
        phone: '+91-416-2244-889',
        email: 'hello@rosepetal.demo',
        website: 'https://rosepetal.demo',
        owner: salonOwner3._id,
        categories: [categories[4]._id, categories[2]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 15,
        rating: 4.7,
        reviewCount: 56
      },
      {
        name: 'Blush Studios',
        slug: 'blush-studios',
        coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=200&h=200&fit=crop&crop=faces',
        description: 'Modern unisex salon in Hyderabad known for trendy cuts and pro makeup.',
        address: '210, Jubilee Hills Road',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'IN',
        postalCode: '500033',
        latitude: 17.4319,
        longitude: 78.4045,
        phone: '+91-40-2355-8811',
        email: 'hello@blushstudios.demo',
        website: 'https://blushstudios.demo',
        owner: salonOwner3._id,
        categories: [categories[0]._id, categories[1]._id, categories[4]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 10,
        rating: 4.6,
        reviewCount: 42
      },
      {
        name: 'Nail Vibe Lounge',
        slug: 'nail-vibe-lounge',
        coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&crop=faces',
        description: 'Trendy nail art and express mani-pedi studio in the heart of Coimbatore.',
        address: '44, Avinashi Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '641004',
        latitude: 11.0168,
        longitude: 76.9558,
        phone: '+91-422-2498-776',
        email: 'hello@nailvibe.demo',
        website: 'https://nailvibe.demo',
        owner: salonOwner3._id,
        categories: [categories[3]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 10,
        rating: 4.4,
        reviewCount: 29
      },
      {
        name: 'Kaapi & Cuts',
        slug: 'kaapi-cuts',
        coverImage: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1567449303078-57ad995bd17a?w=200&h=200&fit=crop&crop=faces',
        description: 'Aged-cask style barbershop in Kozhikode serving classic cuts with coffee.',
        address: '15/7, SM Street',
        city: 'Kozhikode',
        state: 'Kerala',
        country: 'IN',
        postalCode: '673001',
        latitude: 11.2588,
        longitude: 75.7804,
        phone: '+91-495-2701-220',
        email: 'hello@kaapicuts.demo',
        website: 'https://kaapicuts.demo',
        owner: salonOwner2._id,
        categories: [categories[6]._id, categories[0]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 15,
        rating: 4.8,
        reviewCount: 71
      },
      {
        name: 'Spa Essentia',
        slug: 'spa-essentia',
        coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=200&h=200&fit=crop&crop=faces',
        description: 'Premium wellness spa offering deep-tissue and ayurvedic therapies in Thiruvananthapuram.',
        address: '32, Vazhuthacaud Road',
        city: 'Thiruvananthapuram',
        state: 'Kerala',
        country: 'IN',
        postalCode: '695014',
        latitude: 8.5061,
        longitude: 76.9569,
        phone: '+91-471-2321-556',
        email: 'hello@spaessentia.demo',
        website: 'https://spaessentia.demo',
        owner: salonOwner3._id,
        categories: [categories[5]._id, categories[2]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 20,
        rating: 4.9,
        reviewCount: 98
      },
      {
        name: 'Aura Bridal Studio',
        slug: 'aura-bridal-studio',
        coverImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=500&fit=crop',
        logo: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=200&h=200&fit=crop&crop=faces',
        description: 'Chennai’s favourite bridal destination for makeup, draping and mehendi.',
        address: '102, Greams Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'IN',
        postalCode: '600006',
        latitude: 13.0722,
        longitude: 80.2521,
        phone: '+91-44-4355-9900',
        email: 'hello@aurabridal.demo',
        website: 'https://aurabridal.demo',
        owner: salonOwner3._id,
        categories: [categories[4]._id, categories[2]._id],
        openingHours: defaultOpeningHours,
        bufferTime: 20,
        rating: 4.8,
        reviewCount: 63
      }
    ]);

    console.log('Salons seeded');

    await Salon.findByIdAndUpdate(salons[0]._id, { $set: { managers: [manager._id] } });

    const allServices = [];

    const luxeHairServices = await Service.insertMany([
      { salon: salons[0]._id, category: categories[0]._id, name: 'Women\'s Haircut & Style', description: 'Precision cut with wash and professional blow-dry styling', price: 850, duration: 60 },
      { salon: salons[0]._id, category: categories[0]._id, name: 'Men\'s Haircut', description: 'Classic or modern cut with hot towel finish', price: 450, duration: 30 },
      { salon: salons[0]._id, category: categories[0]._id, name: 'Blowout & Styling', description: 'Wash and professional blow-dry with styling', price: 550, duration: 45 },
      { salon: salons[0]._id, category: categories[0]._id, name: 'Deep Conditioning Treatment', description: 'Intensive hair repair and moisture treatment', price: 400, duration: 30 },
      { salon: salons[0]._id, category: categories[1]._id, name: 'Full Color', description: 'Single-process hair coloring from roots to ends', price: 1500, duration: 120 },
      { salon: salons[0]._id, category: categories[1]._id, name: 'Balayage', description: 'Hand-painted highlights for a natural, sun-kissed look', price: 2000, duration: 150 },
      { salon: salons[0]._id, category: categories[1]._id, name: 'Highlights', description: 'Foil highlights for dimension and brightness', price: 1750, duration: 120 },
      { salon: salons[0]._id, category: categories[4]._id, name: 'Bridal Makeup', description: 'Complete bridal makeup with consultation and trial', price: 5000, duration: 90 },
      { salon: salons[0]._id, category: categories[4]._id, name: 'Party Makeup', description: 'Glamorous makeup for special occasions', price: 1200, duration: 60 }
    ]);
    allServices.push(...luxeHairServices);

    const serenityServices = await Service.insertMany([
      { salon: salons[1]._id, category: categories[2]._id, name: 'Classic Facial', description: 'Deep cleansing facial with extractions and hydration', price: 950, duration: 60 },
      { salon: salons[1]._id, category: categories[2]._id, name: 'Anti-Aging Facial', description: 'Advanced anti-aging treatment with retinol and peptides', price: 1500, duration: 75 },
      { salon: salons[1]._id, category: categories[2]._id, name: 'HydraFacial', description: 'Multi-step treatment for deep cleansing and hydration', price: 1750, duration: 60 },
      { salon: salons[1]._id, category: categories[5]._id, name: 'Swedish Massage', description: 'Relaxing full-body massage for stress relief', price: 1200, duration: 60 },
      { salon: salons[1]._id, category: categories[5]._id, name: 'Hot Stone Massage', description: 'Heated stone therapy for deep muscle relaxation', price: 1500, duration: 75 },
      { salon: salons[1]._id, category: categories[0]._id, name: 'Haircut & Style', description: 'Professional cut and styling', price: 700, duration: 45 },
      { salon: salons[1]._id, category: categories[0]._id, name: 'Hair Spa Treatment', description: 'Nourishing spa treatment for damaged hair', price: 800, duration: 60 }
    ]);
    allServices.push(...serenityServices);

    const colorBarServices = await Service.insertMany([
      { salon: salons[2]._id, category: categories[1]._id, name: 'Creative Color', description: 'Fashion-forward vibrant color transformations', price: 1800, duration: 150 },
      { salon: salons[2]._id, category: categories[1]._id, name: 'Color Correction', description: 'Expert color correction and repair services', price: 2500, duration: 180 },
      { salon: salons[2]._id, category: categories[1]._id, name: 'Ombre', description: 'Seamless gradient color effect', price: 1900, duration: 150 },
      { salon: salons[2]._id, category: categories[0]._id, name: 'Precision Cut', description: 'Expert cutting technique for any style', price: 750, duration: 45 },
      { salon: salons[2]._id, category: categories[0]._id, name: 'Texture & Waves', description: 'Beach waves or defined texture styling', price: 650, duration: 45 }
    ]);
    allServices.push(...colorBarServices);

    const nailServices = await Service.insertMany([
      { salon: salons[3]._id, category: categories[3]._id, name: 'Classic Manicure', description: 'Nail shaping, cuticle care, and polish', price: 350, duration: 30 },
      { salon: salons[3]._id, category: categories[3]._id, name: 'Gel Manicure', description: 'Long-lasting gel polish application', price: 500, duration: 45 },
      { salon: salons[3]._id, category: categories[3]._id, name: 'Nail Art Design', description: 'Custom artistic nail designs', price: 650, duration: 60 },
      { salon: salons[3]._id, category: categories[3]._id, name: 'Spa Pedicure', description: 'Relaxing pedicure with exfoliation and massage', price: 550, duration: 45 },
      { salon: salons[3]._id, category: categories[3]._id, name: 'Acrylic Full Set', description: 'Full set of acrylic nails with design', price: 800, duration: 75 }
    ]);
    allServices.push(...nailServices);

    const groomServices = await Service.insertMany([
      { salon: salons[4]._id, category: categories[6]._id, name: 'Classic Haircut', description: 'Traditional barber cut with styling', price: 350, duration: 30 },
      { salon: salons[4]._id, category: categories[6]._id, name: 'Hot Towel Shave', description: 'Luxurious hot towel straight razor shave', price: 300, duration: 25 },
      { salon: salons[4]._id, category: categories[6]._id, name: 'Beard Sculpting', description: 'Precision beard trimming and shaping', price: 250, duration: 20 },
      { salon: salons[4]._id, category: categories[6]._id, name: 'The Full Works', description: 'Haircut, shave, and beard trim combo', price: 650, duration: 60 },
      { salon: salons[4]._id, category: categories[0]._id, name: 'Fade Cut', description: 'Modern fade haircut with precision blending', price: 400, duration: 35 }
    ]);
    allServices.push(...groomServices);

    const rosePetalServices = await Service.insertMany([
      { salon: salons[5]._id, category: categories[4]._id, name: 'Bridal Makeup', description: 'Complete bridal makeup with draping and hairstyle', price: 4500, duration: 90 },
      { salon: salons[5]._id, category: categories[4]._id, name: 'Party Makeup', description: 'Glam makeup for receptions and events', price: 1500, duration: 60 },
      { salon: salons[5]._id, category: categories[4]._id, name: 'Mehendi Application', description: 'Intricate bridal mehendi designs', price: 2000, duration: 120 },
      { salon: salons[5]._id, category: categories[2]._id, name: 'Fruit Facial', description: 'Refreshing facial with natural fruit extracts', price: 800, duration: 45 },
      { salon: salons[5]._id, category: categories[2]._id, name: 'Gold Facial', description: 'Luxury facial with gold-infused serums', price: 1800, duration: 75 }
    ]);
    allServices.push(...rosePetalServices);

    const blushServices = await Service.insertMany([
      { salon: salons[6]._id, category: categories[0]._id, name: 'Unisex Haircut', description: 'Modern cut with styling for men and women', price: 600, duration: 45 },
      { salon: salons[6]._id, category: categories[1]._id, name: 'Trendy Hair Color', description: 'Vibrant fashion colors and global highlights', price: 2200, duration: 120 },
      { salon: salons[6]._id, category: categories[1]._id, name: 'Keratin Treatment', description: 'Smooth and frizzy-free keratin smoothing', price: 3500, duration: 150 },
      { salon: salons[6]._id, category: categories[4]._id, name: 'Editorial Makeup', description: 'High-fashion makeup for shoots and events', price: 3000, duration: 75 },
      { salon: salons[6]._id, category: categories[0]._id, name: 'Blowout & Setting', description: 'Wash and trendy blow-dry setting', price: 800, duration: 45 }
    ]);
    allServices.push(...blushServices);

    const nailVibeServices = await Service.insertMany([
      { salon: salons[7]._id, category: categories[3]._id, name: 'Express Manicure', description: 'Quick nail shaping and polish', price: 300, duration: 25 },
      { salon: salons[7]._id, category: categories[3]._id, name: 'Gel Extension', description: 'Full gel nail extensions with design', price: 900, duration: 60 },
      { salon: salons[7]._id, category: categories[3]._id, name: 'Chrome Nails', description: 'Mirror-shine chrome nail finish', price: 700, duration: 45 },
      { salon: salons[7]._id, category: categories[3]._id, name: 'Luxury Spa Pedi', description: 'Premium pedicure with massage', price: 700, duration: 50 }
    ]);
    allServices.push(...nailVibeServices);

    const kaapiServices = await Service.insertMany([
      { salon: salons[8]._id, category: categories[6]._id, name: 'Signature Haircut', description: 'Classic barber cut with razor finish', price: 450, duration: 35 },
      { salon: salons[8]._id, category: categories[6]._id, name: 'Royal Shave', description: 'Traditional razor shave with hot towels', price: 400, duration: 30 },
      { salon: salons[8]._id, category: categories[6]._id, name: 'Beard & Mustache Trim', description: 'Precision facial hair sculpting', price: 300, duration: 25 },
      { salon: salons[8]._id, category: categories[0]._id, name: 'Hair Reset & Style', description: 'Restyle and finish any look', price: 500, duration: 40 }
    ]);
    allServices.push(...kaapiServices);

    const spaEssentiaServices = await Service.insertMany([
      { salon: salons[9]._id, category: categories[5]._id, name: 'Ayurvedic Abhyanga', description: 'Traditional warm oil full-body therapy', price: 2500, duration: 90 },
      { salon: salons[9]._id, category: categories[5]._id, name: 'Deep Tissue Massage', description: 'Firm pressure therapeutic massage', price: 2000, duration: 60 },
      { salon: salons[9]._id, category: categories[2]._id, name: 'Bridal Glow Facial', description: 'Radiance facial prep for brides', price: 2200, duration: 75 },
      { salon: salons[9]._id, category: categories[2]._id, name: 'Charcoal Detox Facial', description: 'Deep pore detox with charcoal masks', price: 1600, duration: 60 }
    ]);
    allServices.push(...spaEssentiaServices);

    const auraServices = await Service.insertMany([
      { salon: salons[10]._id, category: categories[4]._id, name: 'Complete Bridal Package', description: 'Makeup, hairstyle, draping and touch-up', price: 12000, duration: 180 },
      { salon: salons[10]._id, category: categories[4]._id, name: 'Engagement Makeup', description: 'Elegant makeup for engagements', price: 4000, duration: 90 },
      { salon: salons[10]._id, category: categories[4]._id, name: 'Bridal Hairstyle', description: 'Traditional and modern bridal hairstyles', price: 2500, duration: 60 },
      { salon: salons[10]._id, category: categories[2]._id, name: 'Pre-Bridal Facial', description: '2-week glow treatment course', price: 3000, duration: 60 }
    ]);
    allServices.push(...auraServices);

    console.log('Services seeded');

    const staffMembers = await Staff.insertMany([
      {
        salon: salons[0]._id,
        name: 'Priya Dharshini',
        profileImage: '/images/staff/priya.jpg',
        bio: 'Master stylist with 12 years of experience in precision cutting and creative coloring.',
        specialization: 'Hair Color Specialist',
        experience: 12,
        services: [allServices[0]._id, allServices[2]._id, allServices[4]._id, allServices[5]._id, allServices[6]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'friday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[0]._id,
        name: 'Karthik Rajan',
        profileImage: '/images/staff/karthik.jpg',
        bio: 'Creative stylist specializing in modern cuts and fashion-forward styling.',
        specialization: 'Cutting & Styling',
        experience: 8,
        services: [allServices[0]._id, allServices[1]._id, allServices[2]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '10:00', end: '16:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        user: staffUser1._id,
        salon: salons[0]._id,
        name: 'Meena Sundaram',
        profileImage: '/images/staff/meena.jpg',
        bio: 'Professional makeup artist with expertise in bridal and editorial makeup.',
        specialization: 'Makeup Artist',
        experience: 6,
        services: [allServices[7]._id, allServices[8]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'tuesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'wednesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'thursday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'friday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[1]._id,
        name: 'Lakshmi Ramesh',
        profileImage: '/images/staff/lakshmi.jpg',
        bio: 'Licensed esthetician with a passion for skincare and rejuvenation therapies.',
        specialization: 'Skincare Specialist',
        experience: 10,
        services: [allServices[9]._id, allServices[10]._id, allServices[11]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '10:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[1]._id,
        name: 'Daniel Varma',
        profileImage: '/images/staff/daniel.jpg',
        bio: 'Certified massage therapist specializing in relaxation and therapeutic techniques.',
        specialization: 'Massage Therapist',
        experience: 7,
        services: [allServices[12]._id, allServices[13]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '10:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        user: staffUser2._id,
        salon: salons[1]._id,
        name: 'Arun Prasad',
        profileImage: '/images/staff/arun.jpg',
        bio: 'Versatile stylist with expertise in both classic and contemporary hair techniques.',
        specialization: 'Hair Stylist',
        experience: 5,
        services: [allServices[14]._id, allServices[15]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '10:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[2]._id,
        name: 'Vandana Devi',
        profileImage: '/images/staff/vandana.jpg',
        bio: 'Award-winning colorist known for creative color transformations and balayage mastery.',
        specialization: 'Color Specialist',
        experience: 15,
        services: [allServices[16]._id, allServices[17]._id, allServices[18]._id, allServices[19]._id, allServices[20]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'tuesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'wednesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'thursday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'friday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[3]._id,
        name: 'Nithya Nair',
        profileImage: '/images/staff/nithya.jpg',
        bio: 'Nail art specialist with a flair for intricate designs and premium nail care.',
        specialization: 'Nail Artist',
        experience: 9,
        services: [allServices[21]._id, allServices[22]._id, allServices[23]._id, allServices[24]._id, allServices[25]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[4]._id,
        name: 'Ganesh Kumar',
        profileImage: '/images/staff/ganesh.jpg',
        bio: 'Traditional barber with modern techniques. Expert in classic cuts and razor shaves.',
        specialization: 'Master Barber',
        experience: 20,
        services: [allServices[26]._id, allServices[27]._id, allServices[28]._id, allServices[29]._id, allServices[30]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[5]._id,
        name: 'Reshma Banu',
        profileImage: '/images/staff/reshma.jpg',
        bio: 'Award-winning makeup artist specialising in bridal and traditional styles.',
        specialization: 'Bridal Makeup Artist',
        experience: 9,
        services: [allServices[31]._id, allServices[32]._id, allServices[33]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'tuesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'wednesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'thursday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'friday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[6]._id,
        name: 'Tanvi Reddy',
        profileImage: '/images/staff/tanvi.jpg',
        bio: 'Fashion-forward stylist and colorist with editorial training.',
        specialization: 'Color & Styling Expert',
        experience: 7,
        services: [allServices[36]._id, allServices[37]._id, allServices[38]._id, allServices[39]._id, allServices[40]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '10:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[7]._id,
        name: 'Ayesha Fathima',
        profileImage: '/images/staff/ayesha.jpg',
        bio: 'Nail artist with a sharp eye for intricate chrome and gel designs.',
        specialization: 'Nail Artist',
        experience: 5,
        services: [allServices[41]._id, allServices[42]._id, allServices[43]._id, allServices[44]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[8]._id,
        name: 'Rahul Nair',
        profileImage: '/images/staff/rahul.jpg',
        bio: 'Master barber known for the classic royal shave and razor work.',
        specialization: 'Master Barber',
        experience: 14,
        services: [allServices[45]._id, allServices[46]._id, allServices[47]._id, allServices[48]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[9]._id,
        name: 'Divya Menon',
        profileImage: '/images/staff/divya.jpg',
        bio: 'Certified therapist specialising in ayurvedic and deep-tissue therapies.',
        specialization: 'Spa Therapist',
        experience: 11,
        services: [allServices[49]._id, allServices[50]._id, allServices[51]._id, allServices[52]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'tuesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'wednesday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'thursday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'friday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'saturday', enabled: true, start: '10:00', end: '17:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      },
      {
        salon: salons[10]._id,
        name: 'Kavya Rao',
        profileImage: '/images/staff/kavya.jpg',
        bio: 'Lead bridal makeup artist with a decade of wedding experience.',
        specialization: 'Bridal Makeup Expert',
        experience: 10,
        services: [allServices[53]._id, allServices[54]._id, allServices[55]._id, allServices[56]._id],
        workingHours: [
          { day: 'monday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'tuesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'wednesday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'thursday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'friday', enabled: true, start: '10:00', end: '19:00' },
          { day: 'saturday', enabled: true, start: '09:00', end: '18:00' },
          { day: 'sunday', enabled: false, start: '10:00', end: '16:00' }
        ],
        isAvailable: true
      }
    ]);

    console.log('Staff seeded');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const appointments = await Appointment.insertMany([
      {
        customer: customers[0]._id,
        salon: salons[0]._id,
        service: allServices[0]._id,
        staff: staffMembers[0]._id,
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed',
        price: 850,
        notes: 'First time visit'
      },
      {
        customer: customers[1]._id,
        salon: salons[0]._id,
        service: allServices[1]._id,
        staff: staffMembers[1]._id,
        date: tomorrow,
        startTime: '14:00',
        endTime: '14:30',
        status: 'confirmed',
        price: 450
      },
      {
        customer: customers[2]._id,
        salon: salons[1]._id,
        service: allServices[9]._id,
        staff: staffMembers[3]._id,
        date: dayAfter,
        startTime: '11:00',
        endTime: '12:00',
        status: 'pending',
        price: 950
      },
      {
        customer: customers[0]._id,
        salon: salons[1]._id,
        service: allServices[12]._id,
        staff: staffMembers[4]._id,
        date: threeDaysLater,
        startTime: '15:00',
        endTime: '16:00',
        status: 'confirmed',
        price: 1200
      },
      {
        customer: customers[3]._id,
        salon: salons[2]._id,
        service: allServices[16]._id,
        staff: staffMembers[6]._id,
        date: lastWeek,
        startTime: '10:00',
        endTime: '12:30',
        status: 'completed',
        price: 1800
      },
      {
        customer: customers[4]._id,
        salon: salons[3]._id,
        service: allServices[22]._id,
        staff: staffMembers[7]._id,
        date: lastWeek,
        startTime: '14:00',
        endTime: '14:45',
        status: 'completed',
        price: 500
      },
      {
        customer: customers[0]._id,
        salon: salons[4]._id,
        service: allServices[29]._id,
        staff: staffMembers[8]._id,
        date: lastWeek,
        startTime: '11:00',
        endTime: '12:00',
        status: 'completed',
        price: 650
      }
    ]);

    console.log('Appointments seeded');

    await Review.insertMany([
      {
        customer: customers[3]._id,
        salon: salons[2]._id,
        appointment: appointments[4]._id,
        rating: 5,
        comment: 'Vandana is an absolute color genius! She transformed my hair perfectly.',
        isApproved: true
      },
      {
        customer: customers[4]._id,
        salon: salons[3]._id,
        appointment: appointments[5]._id,
        rating: 4,
        comment: 'Amazing nail art skills. Nithya really knows her craft!',
        isApproved: true
      },
      {
        customer: customers[0]._id,
        salon: salons[4]._id,
        appointment: appointments[6]._id,
        rating: 5,
        comment: 'Best barbershop in town. Ganesh gave me the perfect fade.',
        isApproved: true
      }
    ]);

    console.log('Reviews seeded');

    const notifNow = Date.now();
    const hour = 60 * 60 * 1000;
    await Notification.insertMany([
      {
        user: customers[0]._id,
        type: 'status_update',
        title: 'Appointment confirmed',
        message: 'Your booking for Glow Facial is confirmed at Anu Beauty Studio on Tuesday at 10:00 AM.',
        data: { appointmentId: appointments[0]._id.toString(), salonId: salons[0]._id.toString() },
        isRead: false,
        createdAt: new Date(notifNow - 2 * hour)
      },
      {
        user: customers[0]._id,
        type: 'booking',
        title: 'Booking received',
        message: 'Your appointment request for Hair Spa at Serenity Spa & Wellness is pending owner approval.',
        data: { appointmentId: appointments[1]._id.toString(), salonId: salons[1]._id.toString() },
        isRead: false,
        createdAt: new Date(notifNow - 5 * hour)
      },
      {
        user: salonOwner._id,
        type: 'booking',
        title: 'New booking received',
        message: 'A customer booked Hair Cut & Styling at Anu Beauty Studio today at 10:00 AM.',
        data: { appointmentId: appointments[0]._id.toString(), salonId: salons[0]._id.toString() },
        isRead: false,
        createdAt: new Date(notifNow - 2 * hour)
      },
      {
        user: customers[0]._id,
        type: 'system',
        title: 'Welcome to Velora',
        message: 'Welcome to Velora! Explore salons near you and book your next appointment in minutes.',
        data: {},
        isRead: true,
        createdAt: new Date(notifNow - 24 * hour)
      }
    ]);

    console.log('Notifications seeded');
    console.log('\n--- Seed Complete ---');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@velora.demo / Password123!');
    console.log('Salon Owner: owner@velora.demo / Password123!');
    console.log('Customer: customer@velora.demo / Password123!');
    console.log('Staff: staff@velora.demo / Password123!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
