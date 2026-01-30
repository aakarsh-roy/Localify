const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const ServiceProvider = require('./models/ServiceProvider');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await ServiceProvider.deleteMany({});

    console.log('Cleared existing data');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Electrician', description: 'Electrical repair and installation services', icon: 'zap', order: 1 },
      { name: 'Plumber', description: 'Plumbing repair and installation services', icon: 'droplet', order: 2 },
      { name: 'Carpenter', description: 'Woodwork and furniture services', icon: 'hammer', order: 3 },
      { name: 'AC Technician', description: 'Air conditioning repair and maintenance', icon: 'wind', order: 4 },
      { name: 'Painter', description: 'House painting and wall finishing', icon: 'paintbrush', order: 5 },
      { name: 'Cleaner', description: 'Home and office cleaning services', icon: 'sparkles', order: 6 },
      { name: 'Appliance Repair', description: 'Home appliance repair services', icon: 'wrench', order: 7 },
      { name: 'Pest Control', description: 'Pest elimination and prevention', icon: 'bug', order: 8 }
    ]);

    console.log('Categories created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@localify.com',
      password: adminPassword,
      role: 'admin',
      phone: '9999999999'
    });

    // Create sample users
    const userPassword = await bcrypt.hash('user123', 10);
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        phone: '9876543210',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610],
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user',
        phone: '9876543211',
        location: {
          type: 'Point',
          coordinates: [-73.985428, 40.748817],
          address: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002'
        }
      }
    ]);

    console.log('Users created');

    // Create provider users
    const providerPassword = await bcrypt.hash('provider123', 10);
    const providerUsers = await User.insertMany([
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: providerPassword,
        role: 'provider',
        phone: '8765432109'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: providerPassword,
        role: 'provider',
        phone: '8765432108'
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: providerPassword,
        role: 'provider',
        phone: '8765432107'
      }
    ]);

    // Create service providers
    await ServiceProvider.insertMany([
      {
        user: providerUsers[0]._id,
        businessName: 'Mike\'s Electric Services',
        description: 'Professional electrical services with 10 years of experience. We handle all types of electrical work from repairs to new installations.',
        services: [
          { category: categories[0]._id, name: 'Electrical Repair', price: 50, priceType: 'hourly', description: 'Fix electrical issues' },
          { category: categories[0]._id, name: 'Wiring Installation', price: 200, priceType: 'fixed', description: 'New wiring installation' }
        ],
        location: {
          type: 'Point',
          coordinates: [-73.945242, 40.740610],
          address: '789 Electric Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        },
        experience: 10,
        averageRating: 4.5,
        totalReviews: 23,
        totalCompletedJobs: 45,
        availability: {
          isAvailable: true,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          workingHours: { start: '08:00', end: '18:00' }
        },
        verificationStatus: 'verified'
      },
      {
        user: providerUsers[1]._id,
        businessName: 'Sarah\'s Plumbing Solutions',
        description: 'Expert plumbing services for residential and commercial properties. Quick response and quality work guaranteed.',
        services: [
          { category: categories[1]._id, name: 'Leak Repair', price: 75, priceType: 'fixed', description: 'Fix leaky pipes and faucets' },
          { category: categories[1]._id, name: 'Drain Cleaning', price: 100, priceType: 'fixed', description: 'Professional drain cleaning' }
        ],
        location: {
          type: 'Point',
          coordinates: [-73.955242, 40.720610],
          address: '321 Plumber St',
          city: 'New York',
          state: 'NY',
          zipCode: '10004'
        },
        experience: 8,
        averageRating: 4.8,
        totalReviews: 31,
        totalCompletedJobs: 67,
        availability: {
          isAvailable: true,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          workingHours: { start: '07:00', end: '19:00' }
        },
        verificationStatus: 'verified'
      },
      {
        user: providerUsers[2]._id,
        businessName: 'David\'s Carpentry Works',
        description: 'Custom carpentry and woodwork. From furniture repair to custom builds, we do it all with precision.',
        services: [
          { category: categories[2]._id, name: 'Furniture Repair', price: 60, priceType: 'hourly', description: 'Repair damaged furniture' },
          { category: categories[2]._id, name: 'Custom Furniture', price: 500, priceType: 'negotiable', description: 'Build custom furniture' }
        ],
        location: {
          type: 'Point',
          coordinates: [-73.925242, 40.750610],
          address: '654 Wood Lane',
          city: 'New York',
          state: 'NY',
          zipCode: '10005'
        },
        experience: 15,
        averageRating: 4.2,
        totalReviews: 18,
        totalCompletedJobs: 34,
        availability: {
          isAvailable: true,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          workingHours: { start: '09:00', end: '17:00' }
        },
        verificationStatus: 'verified'
      }
    ]);

    console.log('Service providers created');

    console.log('\n=== Seed Data Complete ===');
    console.log('Admin: admin@localify.com / admin123');
    console.log('User: john@example.com / user123');
    console.log('Provider: mike@example.com / provider123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
