const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../src/models/admin.model');

const deleteAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const result = await Admin.deleteOne({ username: process.env.ADMIN_USERNAME });
    console.log('Deleted:', result);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

deleteAdmin();
