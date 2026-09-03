require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node create_admin.js <username> <password>');
  process.exit(1);
}

const run = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);

    let user = await User.findOne({ username: username.trim() });
    if (user) {
      user.password = password;
      await user.save();
      console.log(`✅ Admin user "${username.trim()}" password updated successfully!`);
    } else {
      user = new User({
        username: username.trim(),
        password: password
      });
      await user.save();
      console.log(`✅ Admin user "${username.trim()}" created successfully!`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating/updating admin:', err);
    process.exit(1);
  }
};

run();
