const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Retrieve MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URI;


// connect to database
const connectDB = async () => {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); //failure to connect to the database
  }
};

// Handle  shutdown of the database connection
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (err) {
    console.error('MongoDB disconnection error:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
