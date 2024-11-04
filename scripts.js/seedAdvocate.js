const faker = require("faker");
const Advocate = require("../models/advocate");
const { connectDB, disconnectDB } = require('../config/db'); // Adjust the path according to your project structure

// MongoDB connection URI
const mongoURI = "your_mongodb_connection_uri_here"; // Replace with your actual MongoDB URI

// Function to seed advocates
const seedAdvocates = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("Connected to MongoDB...");

    // Generate advocate data
    const advocates = Array.from({ length: 20 }, () => ({
      fullName: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      mobileNumber: faker.phone.phoneNumber('##########'), // 10 digits
      password: faker.internet.password(),
      barLicenseNumber: faker.random.alphaNumeric(10), // Adjust based on your requirement
      dateOfBirth: faker.date.past(30, new Date('2000-01-01')), // Born at least 30 years ago
      specialization: [faker.random.arrayElement(['Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law'])],
      location: {
        type: 'Point',
        coordinates: [faker.address.longitude(), faker.address.latitude()],
      },  
      state: faker.address.state(),
      place: faker.address.city(),
      digitalSignature: faker.image.imageUrl(), // Example URL for a digital signature
      profileImage: faker.image.avatar(),
      status: faker.random.arrayElement(['active', 'inactive', 'suspended']),
    }));

    // Insert the advocates into the database
    await Advocate.insertMany(advocates);

    console.log("20 Advocates have been seeded successfully!");
  } catch (error) {
    console.error("Error seeding advocates:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
};

// Run the seed function
seedAdvocates();
