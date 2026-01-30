const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const ServiceProvider = require('./models/ServiceProvider');

// Mumbai area locations with coordinates
const mumbaiLocations = [
  { area: 'Andheri West', coordinates: [72.8362, 19.1364], zipCode: '400053' },
  { area: 'Bandra West', coordinates: [72.8296, 19.0596], zipCode: '400050' },
  { area: 'Juhu', coordinates: [72.8267, 19.1075], zipCode: '400049' },
  { area: 'Powai', coordinates: [72.9052, 19.1176], zipCode: '400076' },
  { area: 'Malad West', coordinates: [72.8403, 19.1872], zipCode: '400064' },
  { area: 'Goregaon East', coordinates: [72.8630, 19.1663], zipCode: '400063' },
  { area: 'Borivali West', coordinates: [72.8544, 19.2307], zipCode: '400092' },
  { area: 'Kandivali East', coordinates: [72.8697, 19.2047], zipCode: '400101' },
  { area: 'Thane West', coordinates: [72.9781, 19.2183], zipCode: '400601' },
  { area: 'Vashi', coordinates: [72.9988, 19.0771], zipCode: '400703' },
  { area: 'Dadar West', coordinates: [72.8426, 19.0178], zipCode: '400028' },
  { area: 'Lower Parel', coordinates: [72.8296, 18.9986], zipCode: '400013' },
  { area: 'Worli', coordinates: [72.8181, 19.0176], zipCode: '400018' },
  { area: 'Colaba', coordinates: [72.8318, 18.9067], zipCode: '400005' },
  { area: 'Churchgate', coordinates: [72.8271, 18.9322], zipCode: '400020' },
  { area: 'Santacruz West', coordinates: [72.8410, 19.0830], zipCode: '400054' },
  { area: 'Khar West', coordinates: [72.8333, 19.0726], zipCode: '400052' },
  { area: 'Versova', coordinates: [72.8162, 19.1315], zipCode: '400061' },
  { area: 'Chembur', coordinates: [72.8971, 19.0522], zipCode: '400071' },
  { area: 'Ghatkopar West', coordinates: [72.9080, 19.0858], zipCode: '400086' }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await ServiceProvider.deleteMany({});

    console.log('Cleared existing data');

    // Drop indexes to avoid slug issues
    try {
      await Category.collection.dropIndexes();
    } catch (e) {
      // Ignore if no indexes exist
    }

    // Create categories one by one to trigger pre-save hook for slug generation
    const categoryData = [
      { name: 'Electrician', description: 'Electrical repair and installation services', icon: 'zap', order: 1 },
      { name: 'Plumber', description: 'Plumbing repair and installation services', icon: 'droplet', order: 2 },
      { name: 'Carpenter', description: 'Woodwork and furniture services', icon: 'hammer', order: 3 },
      { name: 'AC Technician', description: 'Air conditioning repair and maintenance', icon: 'wind', order: 4 },
      { name: 'Painter', description: 'House painting and wall finishing', icon: 'paintbrush', order: 5 },
      { name: 'Cleaner', description: 'Home and office cleaning services', icon: 'sparkles', order: 6 },
      { name: 'Appliance Repair', description: 'Home appliance repair services', icon: 'wrench', order: 7 },
      { name: 'Pest Control', description: 'Pest elimination and prevention', icon: 'bug', order: 8 }
    ];

    const categories = [];
    for (const cat of categoryData) {
      const category = await Category.create(cat);
      categories.push(category);
    }

    console.log('Categories created');

    // Create admin user (password will be hashed by User model pre-save hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@localify.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999'
    });

    // Create sample users in Mumbai
    const users = await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'user123',
        role: 'user',
        phone: '9876543210',
        location: {
          type: 'Point',
          coordinates: [72.8362, 19.1364],
          address: '123 Link Road, Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400053'
        }
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'user123',
        role: 'user',
        phone: '9876543211',
        location: {
          type: 'Point',
          coordinates: [72.8296, 19.0596],
          address: '456 Hill Road, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400050'
        }
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        password: 'user123',
        role: 'user',
        phone: '9876543212',
        location: {
          type: 'Point',
          coordinates: [72.9052, 19.1176],
          address: '789 Hiranandani Gardens, Powai',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400076'
        }
      }
    ]);

    console.log('Users created');

    // Provider data by category
    const providerData = [
      // Electricians
      { name: 'Rajesh Kumar', email: 'rajesh.electric@example.com', business: 'Rajesh Electric Works', category: 0, location: 0, experience: 12, rating: 4.7, reviews: 156, jobs: 234 },
      { name: 'Sunil Yadav', email: 'sunil.power@example.com', business: 'Power House Electricals', category: 0, location: 1, experience: 8, rating: 4.5, reviews: 89, jobs: 145 },
      { name: 'Manoj Singh', email: 'manoj.electric@example.com', business: 'Singh Electrical Services', category: 0, location: 4, experience: 15, rating: 4.8, reviews: 203, jobs: 312 },
      { name: 'Deepak Joshi', email: 'deepak.wire@example.com', business: 'Wire Masters', category: 0, location: 10, experience: 6, rating: 4.3, reviews: 67, jobs: 98 },
      { name: 'Prakash Nair', email: 'prakash.electric@example.com', business: 'Nair Electricals', category: 0, location: 18, experience: 10, rating: 4.6, reviews: 124, jobs: 189 },
      
      // Plumbers
      { name: 'Ramesh Gupta', email: 'ramesh.plumb@example.com', business: 'Gupta Plumbing Solutions', category: 1, location: 2, experience: 14, rating: 4.6, reviews: 178, jobs: 267 },
      { name: 'Vijay Sharma', email: 'vijay.pipes@example.com', business: 'Quick Fix Plumbers', category: 1, location: 3, experience: 9, rating: 4.4, reviews: 92, jobs: 156 },
      { name: 'Sanjay Patil', email: 'sanjay.plumb@example.com', business: 'Patil Plumbing Works', category: 1, location: 5, experience: 11, rating: 4.7, reviews: 145, jobs: 223 },
      { name: 'Anil Thakur', email: 'anil.water@example.com', business: 'Thakur Plumbers', category: 1, location: 11, experience: 7, rating: 4.2, reviews: 56, jobs: 87 },
      { name: 'Kiran Desai', email: 'kiran.plumb@example.com', business: 'Desai Plumbing Services', category: 1, location: 19, experience: 13, rating: 4.8, reviews: 189, jobs: 298 },
      
      // Carpenters
      { name: 'Ashok Mishra', email: 'ashok.wood@example.com', business: 'Mishra Furniture Works', category: 2, location: 6, experience: 18, rating: 4.9, reviews: 234, jobs: 345 },
      { name: 'Ravi Tiwari', email: 'ravi.carpenter@example.com', business: 'Tiwari Wood Crafts', category: 2, location: 7, experience: 10, rating: 4.5, reviews: 98, jobs: 167 },
      { name: 'Mohan Das', email: 'mohan.wood@example.com', business: 'Das Carpentry', category: 2, location: 12, experience: 20, rating: 4.8, reviews: 267, jobs: 398 },
      { name: 'Gopal Verma', email: 'gopal.furniture@example.com', business: 'Verma Furniture House', category: 2, location: 15, experience: 8, rating: 4.4, reviews: 76, jobs: 123 },
      { name: 'Suresh Jain', email: 'suresh.wood@example.com', business: 'Jain Wood Works', category: 2, location: 16, experience: 12, rating: 4.6, reviews: 134, jobs: 212 },
      
      // AC Technicians
      { name: 'Nikhil Shah', email: 'nikhil.ac@example.com', business: 'Cool Air Services', category: 3, location: 0, experience: 8, rating: 4.7, reviews: 145, jobs: 234 },
      { name: 'Rohit Mehta', email: 'rohit.cooling@example.com', business: 'Mehta AC Repairs', category: 3, location: 3, experience: 6, rating: 4.3, reviews: 67, jobs: 112 },
      { name: 'Vikram Reddy', email: 'vikram.ac@example.com', business: 'Reddy Cooling Solutions', category: 3, location: 8, experience: 12, rating: 4.8, reviews: 198, jobs: 312 },
      { name: 'Santosh Iyer', email: 'santosh.ac@example.com', business: 'Iyer AC Services', category: 3, location: 13, experience: 9, rating: 4.5, reviews: 89, jobs: 156 },
      { name: 'Dinesh Pillai', email: 'dinesh.cool@example.com', business: 'Pillai Cooling Works', category: 3, location: 17, experience: 7, rating: 4.4, reviews: 78, jobs: 134 },
      
      // Painters
      { name: 'Rajan Nair', email: 'rajan.paint@example.com', business: 'Nair Painting Services', category: 4, location: 1, experience: 15, rating: 4.6, reviews: 167, jobs: 256 },
      { name: 'Prem Kumar', email: 'prem.colors@example.com', business: 'Color Masters', category: 4, location: 4, experience: 10, rating: 4.4, reviews: 98, jobs: 167 },
      { name: 'Arun Saxena', email: 'arun.paint@example.com', business: 'Saxena Paints', category: 4, location: 9, experience: 12, rating: 4.7, reviews: 145, jobs: 223 },
      { name: 'Mahesh Kulkarni', email: 'mahesh.wall@example.com', business: 'Kulkarni Wall Designs', category: 4, location: 14, experience: 8, rating: 4.3, reviews: 67, jobs: 112 },
      { name: 'Rajiv Shetty', email: 'rajiv.paint@example.com', business: 'Shetty Color House', category: 4, location: 18, experience: 14, rating: 4.8, reviews: 189, jobs: 287 },
      
      // Cleaners
      { name: 'Lakshmi Devi', email: 'lakshmi.clean@example.com', business: 'Sparkle Clean Services', category: 5, location: 2, experience: 6, rating: 4.5, reviews: 123, jobs: 234 },
      { name: 'Sunita Rao', email: 'sunita.clean@example.com', business: 'Rao Cleaning Solutions', category: 5, location: 5, experience: 8, rating: 4.7, reviews: 156, jobs: 289 },
      { name: 'Geeta Sharma', email: 'geeta.home@example.com', business: 'Home Shine Cleaners', category: 5, location: 10, experience: 5, rating: 4.3, reviews: 78, jobs: 145 },
      { name: 'Kavita Joshi', email: 'kavita.clean@example.com', business: 'Joshi Deep Clean', category: 5, location: 15, experience: 7, rating: 4.6, reviews: 112, jobs: 198 },
      { name: 'Meena Patel', email: 'meena.clean@example.com', business: 'Patel Cleaning Co', category: 5, location: 19, experience: 9, rating: 4.8, reviews: 178, jobs: 312 },
      
      // Appliance Repair
      { name: 'Satish Kumar', email: 'satish.repair@example.com', business: 'Kumar Appliance Repairs', category: 6, location: 0, experience: 11, rating: 4.6, reviews: 134, jobs: 212 },
      { name: 'Harish Menon', email: 'harish.fix@example.com', business: 'Menon Repair Works', category: 6, location: 6, experience: 9, rating: 4.4, reviews: 89, jobs: 156 },
      { name: 'Jitendra Singh', email: 'jitendra.tech@example.com', business: 'Singh Tech Repairs', category: 6, location: 11, experience: 13, rating: 4.8, reviews: 198, jobs: 298 },
      { name: 'Arvind Rao', email: 'arvind.appliance@example.com', business: 'Rao Appliance Center', category: 6, location: 16, experience: 7, rating: 4.3, reviews: 67, jobs: 112 },
      { name: 'Naresh Gupta', email: 'naresh.fix@example.com', business: 'Gupta Repair Hub', category: 6, location: 8, experience: 10, rating: 4.5, reviews: 112, jobs: 178 },
      
      // Pest Control
      { name: 'Vinod Kapoor', email: 'vinod.pest@example.com', business: 'Kapoor Pest Control', category: 7, location: 1, experience: 10, rating: 4.7, reviews: 145, jobs: 234 },
      { name: 'Sudhir Bose', email: 'sudhir.pest@example.com', business: 'Bose Pest Solutions', category: 7, location: 7, experience: 8, rating: 4.5, reviews: 98, jobs: 167 },
      { name: 'Pradeep Chauhan', email: 'pradeep.bug@example.com', business: 'Chauhan Pest Services', category: 7, location: 12, experience: 12, rating: 4.8, reviews: 178, jobs: 278 },
      { name: 'Umesh Thakkar', email: 'umesh.pest@example.com', business: 'Thakkar Pest Free', category: 7, location: 17, experience: 6, rating: 4.2, reviews: 56, jobs: 98 },
      { name: 'Kishore Pandey', email: 'kishore.pest@example.com', business: 'Pandey Pest Control', category: 7, location: 9, experience: 9, rating: 4.6, reviews: 123, jobs: 189 }
    ];

    // Services pricing in INR by category
    const servicesByCategory = [
      // Electrician services (INR)
      [
        { name: 'Electrical Repair', price: 500, priceType: 'hourly', description: 'Fix electrical issues and faults' },
        { name: 'Wiring Installation', price: 3500, priceType: 'fixed', description: 'New wiring installation per room' },
        { name: 'Switchboard Repair', price: 350, priceType: 'fixed', description: 'Repair and replace switchboards' },
        { name: 'Fan Installation', price: 450, priceType: 'fixed', description: 'Ceiling/wall fan installation' },
        { name: 'MCB/Fuse Replacement', price: 250, priceType: 'fixed', description: 'Circuit breaker replacement' }
      ],
      // Plumber services (INR)
      [
        { name: 'Leak Repair', price: 400, priceType: 'fixed', description: 'Fix leaky pipes and faucets' },
        { name: 'Drain Cleaning', price: 600, priceType: 'fixed', description: 'Professional drain cleaning' },
        { name: 'Toilet Repair', price: 500, priceType: 'fixed', description: 'Fix toilet flush and blockages' },
        { name: 'Tap Installation', price: 350, priceType: 'fixed', description: 'Install new taps and faucets' },
        { name: 'Water Tank Cleaning', price: 1500, priceType: 'fixed', description: 'Complete tank cleaning service' }
      ],
      // Carpenter services (INR)
      [
        { name: 'Furniture Repair', price: 600, priceType: 'hourly', description: 'Repair damaged furniture' },
        { name: 'Custom Furniture', price: 15000, priceType: 'negotiable', description: 'Build custom furniture' },
        { name: 'Door Repair', price: 800, priceType: 'fixed', description: 'Fix door hinges and locks' },
        { name: 'Modular Kitchen', price: 50000, priceType: 'negotiable', description: 'Modular kitchen installation' },
        { name: 'Wardrobe Work', price: 25000, priceType: 'negotiable', description: 'Custom wardrobe design and build' }
      ],
      // AC Technician services (INR)
      [
        { name: 'AC Servicing', price: 700, priceType: 'fixed', description: 'Complete AC service and cleaning' },
        { name: 'AC Repair', price: 500, priceType: 'hourly', description: 'Diagnose and fix AC issues' },
        { name: 'AC Installation', price: 1500, priceType: 'fixed', description: 'Split/Window AC installation' },
        { name: 'Gas Refilling', price: 2500, priceType: 'fixed', description: 'AC gas top-up and refill' },
        { name: 'AC Uninstallation', price: 800, priceType: 'fixed', description: 'Safe AC removal and packing' }
      ],
      // Painter services (INR)
      [
        { name: 'Interior Painting', price: 25, priceType: 'fixed', description: 'Per sq ft interior wall painting' },
        { name: 'Exterior Painting', price: 30, priceType: 'fixed', description: 'Per sq ft exterior painting' },
        { name: 'Texture Painting', price: 45, priceType: 'fixed', description: 'Per sq ft texture finish' },
        { name: 'Wood Polish', price: 150, priceType: 'fixed', description: 'Per sq ft wood polishing' },
        { name: 'Waterproofing', price: 55, priceType: 'fixed', description: 'Per sq ft waterproof coating' }
      ],
      // Cleaner services (INR)
      [
        { name: 'Deep Cleaning', price: 3500, priceType: 'fixed', description: 'Complete home deep cleaning' },
        { name: 'Regular Cleaning', price: 1500, priceType: 'fixed', description: 'Standard home cleaning' },
        { name: 'Kitchen Cleaning', price: 1200, priceType: 'fixed', description: 'Deep kitchen cleaning' },
        { name: 'Bathroom Cleaning', price: 600, priceType: 'fixed', description: 'Per bathroom deep clean' },
        { name: 'Sofa Cleaning', price: 800, priceType: 'fixed', description: 'Per seat sofa shampooing' }
      ],
      // Appliance Repair services (INR)
      [
        { name: 'Washing Machine Repair', price: 600, priceType: 'fixed', description: 'Diagnose and repair washing machine' },
        { name: 'Refrigerator Repair', price: 700, priceType: 'fixed', description: 'Fridge repair and gas refill' },
        { name: 'Microwave Repair', price: 500, priceType: 'fixed', description: 'Microwave oven repair' },
        { name: 'TV Repair', price: 800, priceType: 'fixed', description: 'LED/LCD TV repair' },
        { name: 'Geyser Repair', price: 550, priceType: 'fixed', description: 'Water heater repair' }
      ],
      // Pest Control services (INR)
      [
        { name: 'Cockroach Control', price: 1200, priceType: 'fixed', description: 'Cockroach elimination treatment' },
        { name: 'Termite Control', price: 3500, priceType: 'fixed', description: 'Anti-termite treatment' },
        { name: 'Bed Bug Treatment', price: 2500, priceType: 'fixed', description: 'Bed bug elimination' },
        { name: 'Mosquito Control', price: 1500, priceType: 'fixed', description: 'Mosquito fogging service' },
        { name: 'General Pest Control', price: 2000, priceType: 'fixed', description: 'Complete pest control package' }
      ]
    ];

    // Create provider users and service providers
    for (const provider of providerData) {
      const loc = mumbaiLocations[provider.location];
      
      // Create user (password will be hashed by User model pre-save hook)
      const user = await User.create({
        name: provider.name,
        email: provider.email,
        password: 'provider123',
        role: 'provider',
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`
      });

      // Create service provider
      const services = servicesByCategory[provider.category].map(service => ({
        ...service,
        category: categories[provider.category]._id
      }));

      await ServiceProvider.create({
        user: user._id,
        businessName: provider.business,
        description: `Professional ${categories[provider.category].name.toLowerCase()} services in ${loc.area}, Mumbai. ${provider.experience} years of experience with quality work guaranteed. We serve all areas within 10km radius.`,
        services,
        location: {
          type: 'Point',
          coordinates: loc.coordinates,
          address: `${Math.floor(100 + Math.random() * 900)} ${loc.area} Main Road`,
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: loc.zipCode
        },
        experience: provider.experience,
        averageRating: provider.rating,
        totalReviews: provider.reviews,
        totalCompletedJobs: provider.jobs,
        availability: {
          isAvailable: true,
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          workingHours: { start: '08:00', end: '20:00' }
        },
        verificationStatus: 'verified'
      });
    }

    console.log('Service providers created (40 providers across all categories)');

    console.log('\n=== Seed Data Complete ===');
    console.log('Location: Mumbai, Maharashtra');
    console.log('Currency: Indian Rupees (INR)');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@localify.com / admin123');
    console.log('User: rahul@example.com / user123');
    console.log('Provider: rajesh.electric@example.com / provider123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
