const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/stadiumpulse';
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    // Don't crash the whole server — log and let requests fail gracefully
    // until Mongoose reconnects (it retries automatically by default)
  }
};

module.exports = connectDB;

module.exports = connectDB;
