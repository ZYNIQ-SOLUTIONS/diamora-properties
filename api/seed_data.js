require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Inquiry = require('./models/Inquiry');

const sampleProperties = [
  {
    title: "Palm Jumeirah Waterfront Beach Villa",
    description: "Ultra-luxury waterfront estate with private beach frontage, infinity pool, sunken firepit lounge, and panoramic skyline views over the Arabian Gulf.",
    price: 48000000,
    location: "Palm Jumeirah, Dubai",
    propertyType: "Villa",
    bedrooms: 6,
    bathrooms: 7,
    area: 12400,
    imageUrl: "assets/properties/palm-villa.jpg",
    status: "Available"
  },
  {
    title: "Saadiyat Cultural District Townhouse",
    description: "Contemporary travertine stone townhouse with private plunge pool courtyard, steps from Louvre Abu Dhabi and pristine Saadiyat beach.",
    price: 22500000,
    location: "Saadiyat Island, Abu Dhabi",
    propertyType: "Townhouse",
    bedrooms: 4,
    bathrooms: 5,
    area: 5800,
    imageUrl: "assets/properties/saadiyat-townhouse.jpg",
    status: "Available"
  },
  {
    title: "Dubai Hills Golf & Skyline Mansion",
    description: "Striking 3-tier architectural mansion overlooking championship golf greens with unobstructed Downtown Dubai skyline vistas and private basement gallery.",
    price: 36500000,
    location: "Dubai Hills Estate, Dubai",
    propertyType: "Mansion",
    bedrooms: 5,
    bathrooms: 6,
    area: 9600,
    imageUrl: "assets/properties/dubai-hills-mansion.jpg",
    status: "Available"
  },
  {
    title: "Downtown Burj Crown Sky Penthouse",
    description: "Full-floor duplex penthouse crowning an ultra-prime tower with private cantilevered sky pool and 360-degree vistas of Burj Khalifa and Dubai Fountain.",
    price: 65000000,
    location: "Downtown Dubai, Dubai",
    propertyType: "Penthouse",
    bedrooms: 5,
    bathrooms: 7,
    area: 14200,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    status: "Available"
  },
  {
    title: "Al Bateen Royal Waterfront Residence",
    description: "Sovereign waterfront villa nestled in the historic royal enclave of Al Bateen with private 90ft yacht berth, landscaped palm gardens, and majlis wing.",
    price: 42000000,
    location: "Al Bateen, Abu Dhabi",
    propertyType: "Villa",
    bedrooms: 6,
    bathrooms: 8,
    area: 11500,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    status: "Available"
  },
  {
    title: "Yas Island Waterfront Signature Suite",
    description: "High-yield investment suite directly overlooking Yas Marina circuit with branded concierge services and private access to Yas beach club.",
    price: 8500000,
    location: "Yas Island, Abu Dhabi",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 3,
    area: 2100,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    status: "Available"
  }
];

const sampleInquiries = [
  {
    type: "consultation",
    name: "Lord Marcus Vance",
    email: "m.vance@vanceholdings.co.uk",
    phone: "+44 7700 900123",
    budget: "25M+",
    intent: "investment",
    message: "Seeking off-plan duplex penthouse in Downtown Dubai or Palm Jumeirah with high rental yield.",
    status: "New"
  },
  {
    type: "newsletter",
    name: "Sheikh Mansoor Al-Qasimi",
    email: "mansoor.q@privategroup.ae",
    phone: "+971 50 112 3344",
    budget: "10-25M",
    intent: "lifestyle",
    message: "Subscribed for private off-market allocations in Abu Dhabi cultural district.",
    status: "Qualified"
  }
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);

    // 1. Seed Admin User
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({
        username: 'admin',
        password: 'password123'
      });
      await admin.save();
      console.log('✅ Admin user created: username="admin", password="password123"');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // 2. Seed Properties
    const propCount = await Property.countDocuments();
    if (propCount === 0) {
      await Property.insertMany(sampleProperties);
      console.log(`✅ Seeded ${sampleProperties.length} luxury properties`);
    } else {
      console.log(`ℹ️ Properties already exist (${propCount} listings)`);
    }

    // 3. Seed Inquiries
    const inqCount = await Inquiry.countDocuments();
    if (inqCount === 0) {
      await Inquiry.insertMany(sampleInquiries);
      console.log(`✅ Seeded ${sampleInquiries.length} sample VIP leads & inquiries`);
    } else {
      console.log(`ℹ️ Inquiries already exist (${inqCount} leads)`);
    }

    console.log('\n🌟 Diamora Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
