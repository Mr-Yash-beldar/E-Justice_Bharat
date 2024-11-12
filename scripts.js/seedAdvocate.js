const faker = require("faker");
const Advocate = require("../models/advocate");
const { connectDB, disconnectDB } = require('../config/db'); // Adjust the path according to your project structure

// Function to seed advocates
const seedAdvocates = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("Connected to MongoDB...");

    // Generate advocate data
    const advocates = Array.from({ length: 1 }, () => ({
      fullName: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      mobileNumber: faker.phone.phoneNumber('##########'), // 10 digits
      password: faker.internet.password(),
      barLicenseNumber: faker.random.alphaNumeric(10), // Adjust based on your requirement
      dateOfBirth: faker.date.past(30, new Date('2000-01-01')), // Born at least 30 years ago
      specialization: [faker.random.arrayElement(['Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law'])],
      advocate_location: {
        type: 'Point',
        coordinates: [faker.address.longitude(), faker.address.latitude()],
      },  
      state: faker.address.state(),
      place: faker.address.city(),
      other_document: faker.image.imageUrl(), // Example URL for a digital signature
      aadhar_document: faker.image.imageUrl(), // Example URL for a digital signature
      profile_image: faker.image.avatar(),
    }));

    // Insert the advocates into the database
    await Advocate.deleteMany({});
    await Advocate.insertMany(advocates);

    console.log("Advocates have been seeded successfully!");
  } catch (error) {
    console.error("Error seeding advocates:", error);
  } finally {
    // Close the connection
    await disconnectDB();
  }
};

// Run the seed function
seedAdvocates();
