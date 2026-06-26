const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartgo');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    // Do not crash the application startup check, just log the warning
    console.warn('Proceeding without active MongoDB connection (Foundation Mock Mode)...');
  }
};

module.exports = connectDB;
