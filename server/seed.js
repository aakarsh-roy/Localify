const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const ServiceProvider = require('./models/ServiceProvider');

const cities = [
  {
    city: 'Mumbai', state: 'Maharashtra',
    areas: [
      { area: 'Andheri West', coordinates: [72.8362, 19.1364], zipCode: '400053' },
      { area: 'Bandra West', coordinates: [72.8296, 19.0596], zipCode: '400050' },
      { area: 'Juhu', coordinates: [72.8267, 19.1075], zipCode: '400049' },
      { area: 'Powai', coordinates: [72.9052, 19.1176], zipCode: '400076' },
      { area: 'Malad West', coordinates: [72.8403, 19.1872], zipCode: '400064' },
      { area: 'Goregaon East', coordinates: [72.8630, 19.1663], zipCode: '400063' },
      { area: 'Borivali West', coordinates: [72.8544, 19.2307], zipCode: '400092' },
      { area: 'Kandivali East', coordinates: [72.8697, 19.2047], zipCode: '400101' },
      { area: 'Thane West', coordinates: [72.9781, 19.2183], zipCode: '400601' },
      { area: 'Dadar West', coordinates: [72.8426, 19.0178], zipCode: '400028' },
      { area: 'Colaba', coordinates: [72.8318, 18.9067], zipCode: '400005' }
    ]
  },
  {
    city: 'Delhi', state: 'Delhi',
    areas: [
      { area: 'Connaught Place', coordinates: [77.2167, 28.6315], zipCode: '110001' },
      { area: 'Saket', coordinates: [77.2065, 28.5246], zipCode: '110017' },
      { area: 'Hauz Khas', coordinates: [77.1988, 28.5494], zipCode: '110016' },
      { area: 'Vasant Kunj', coordinates: [77.1587, 28.5293], zipCode: '110070' },
      { area: 'Dwarka', coordinates: [77.0500, 28.5790], zipCode: '110075' },
      { area: 'Karol Bagh', coordinates: [77.1900, 28.6510], zipCode: '110005' },
      { area: 'Lajpat Nagar', coordinates: [77.2420, 28.5670], zipCode: '110024' },
      { area: 'Rohini', coordinates: [77.1130, 28.7360], zipCode: '110085' },
      { area: 'Pitampura', coordinates: [77.1350, 28.6980], zipCode: '110034' },
      { area: 'Janakpuri', coordinates: [77.0870, 28.6210], zipCode: '110058' }
    ]
  },
  {
    city: 'Bengaluru', state: 'Karnataka',
    areas: [
      { area: 'Koramangala', coordinates: [77.6271, 12.9279], zipCode: '560034' },
      { area: 'Indiranagar', coordinates: [77.6411, 12.9718], zipCode: '560038' },
      { area: 'Whitefield', coordinates: [77.7499, 12.9698], zipCode: '560066' },
      { area: 'Jayanagar', coordinates: [77.5838, 12.9298], zipCode: '560011' },
      { area: 'HSR Layout', coordinates: [77.6380, 12.9120], zipCode: '560102' },
      { area: 'Marathahalli', coordinates: [77.7010, 12.9560], zipCode: '560037' },
      { area: 'BTM Layout', coordinates: [77.6100, 12.9160], zipCode: '560076' },
      { area: 'Electronic City', coordinates: [77.6690, 12.8450], zipCode: '560100' },
      { area: 'Malleshwaram', coordinates: [77.5700, 13.0030], zipCode: '560003' }
    ]
  },
  {
    city: 'Chennai', state: 'Tamil Nadu',
    areas: [
      { area: 'T. Nagar', coordinates: [80.2319, 13.0418], zipCode: '600017' },
      { area: 'Adyar', coordinates: [80.2573, 13.0012], zipCode: '600020' },
      { area: 'Anna Nagar', coordinates: [80.2116, 13.0850], zipCode: '600040' },
      { area: 'Velachery', coordinates: [80.2209, 12.9774], zipCode: '600042' }
    ]
  },
  {
    city: 'Hyderabad', state: 'Telangana',
    areas: [
      { area: 'Banjara Hills', coordinates: [78.4277, 17.4156], zipCode: '500034' },
      { area: 'Jubilee Hills', coordinates: [78.4011, 17.4326], zipCode: '500033' },
      { area: 'HITEC City', coordinates: [78.3814, 17.4435], zipCode: '500081' },
      { area: 'Gachibowli', coordinates: [78.3587, 17.4401], zipCode: '500032' }
    ]
  }
];

const firstNames = ['Amit', 'Rahul', 'Priya', 'Sneha', 'Rohan', 'Vikram', 'Anjali', 'Sanjay', 'Kavita', 'Suresh', 'Mahesh', 'Neha', 'Pooja', 'Rajesh', 'Sunita', 'Ramesh', 'Anil', 'Kiran', 'Vinod', 'Deepak'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Iyer', 'Menon', 'Das', 'Joshi', 'Rao', 'Desai', 'Nair', 'Kulkarni', 'Shetty', 'Chauhan', 'Pandey'];
const businessWords = ['Services', 'Works', 'Solutions', 'Co.', 'Enterprises', 'Professionals', 'Experts'];

const generateName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
const generateBusiness = (name, categoryName) => {
  const words = [name.split(' ')[1], categoryName, businessWords[Math.floor(Math.random() * businessWords.length)]];
  return words.join(' ');
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Category.deleteMany({});
    await ServiceProvider.deleteMany({});

    console.log('Cleared existing data');

    try { await Category.collection.dropIndexes(); } catch (e) {}

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
      categories.push(await Category.create(cat));
    }
    console.log('Categories created');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@localify.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999'
    });

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

    let userCount = 0;
    let providerCount = 0;

    for (const cityData of cities) {
      // Create a test user in this city
      const loc = cityData.areas[0];
      await User.create({
        name: `${cityData.city} User`,
        email: `user.${cityData.city.toLowerCase()}@example.com`,
        password: 'user123',
        role: 'user',
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        location: {
          type: 'Point',
          coordinates: loc.coordinates,
          address: `123 Main Street, ${loc.area}`,
          city: cityData.city,
          state: cityData.state,
          zipCode: loc.zipCode
        }
      });

      // Create providers across all categories for this city
      for (let c = 0; c < categories.length; c++) {
        const category = categories[c];
        // Create 3 providers per category per city
        for (let p = 0; p < 3; p++) {
          const providerName = generateName();
          const areaLoc = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
          const experience = Math.floor(2 + Math.random() * 15);
          
          const providerUser = await User.create({
            name: providerName,
            email: `provider${providerCount}@example.com`,
            password: 'provider123',
            role: 'provider',
            phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`
          });

          const services = servicesByCategory[c].map(service => ({
            ...service,
            category: category._id
          }));

          await ServiceProvider.create({
            user: providerUser._id,
            businessName: generateBusiness(providerName, category.name),
            description: `Professional ${category.name.toLowerCase()} services in ${areaLoc.area}, ${cityData.city}. ${experience} years of experience with quality work guaranteed. We serve all areas within 15km radius.`,
            services,
            location: {
              type: 'Point',
              coordinates: areaLoc.coordinates,
              address: `${Math.floor(100 + Math.random() * 900)} ${areaLoc.area} Main Road`,
              city: cityData.city,
              state: cityData.state,
              zipCode: areaLoc.zipCode
            },
            experience,
            averageRating: (4 + Math.random()).toFixed(1),
            totalReviews: Math.floor(50 + Math.random() * 200),
            totalCompletedJobs: Math.floor(100 + Math.random() * 400),
            availability: {
              isAvailable: true,
              workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
              workingHours: { start: '08:00', end: '20:00' }
            },
            verificationStatus: 'verified'
          });
          providerCount++;
        }
      }
    }

    console.log(`Successfully created ${providerCount} service providers across ${cities.length} cities.`);
    console.log('\n=== Seed Data Complete ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@localify.com / admin123');
    console.log('User (Mumbai): user.mumbai@example.com / user123');
    console.log('User (Delhi): user.delhi@example.com / user123');
    console.log('Provider (Generic): provider0@example.com / provider123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
