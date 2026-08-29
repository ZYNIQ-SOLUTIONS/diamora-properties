require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected');

    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const admin = new User({
      username: 'admin',
      password: 'password123' // They should change this or configure via env
    });

    await admin.save();
    console.log('Admin user created successfully with username: "admin" and password: "password123"');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
