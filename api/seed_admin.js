require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora');
    console.log('MongoDB connected');

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      console.log('No ADMIN_USERNAME/ADMIN_PASSWORD configured. Skipping auto-seeding.');
      process.exit(0);
    }

    const adminExists = await User.findOne({ username: adminUser });
    if (adminExists) {
      console.log(`User ${adminUser} already exists`);
      process.exit(0);
    }

    const admin = new User({
      username: adminUser,
      password: adminPass
    });

    await admin.save();
    console.log(`User ${adminUser} created successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};
seedAdmin();
