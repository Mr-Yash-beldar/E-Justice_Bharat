const faker = require("faker");
const mongoose = require('mongoose');
const Case = require("../models/cases");
const { connectDB, disconnectDB } = require('../config/db'); // Adjust the path according to your project structure

// Function to seed cases
const seedCases = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("Connected to MongoDB...");

    // Use 'new' keyword for ObjectId creation
    const litigantId = new mongoose.Types.ObjectId('66ee93688883314eeffab248'); // Static litigant ID

    // Generate cases data
    const cases = Array.from({ length: 5 }, () => ({
      case_title: faker.lorem.words(5),
      case_description: faker.lorem.paragraph(),
      case_type: faker.random.arrayElement(["Civil", "Criminal", "Family", "Corporate", "Labor"]),
      filing_date: faker.date.past(2), // Date in the past 2 years
      causeOfAction: faker.lorem.sentence(),
      urgency_level: faker.random.arrayElement(["High", "Medium", "Low"]),
      case_status: "Filed",
      defendantName: faker.name.findName(),
      defendantContactEmail: faker.internet.email(),
      defendantContactPhone: faker.phone.phoneNumber(),
      defendantAddress: faker.address.streetAddress(),
      evidence_provided: faker.datatype.boolean() ? faker.lorem.sentence() : '',
      witness_details: faker.datatype.boolean() ? faker.lorem.sentences(2) : '',
      litigantId, // Static litigant ID for all cases
    }));

    await Case.deleteMany(); //delete all existing cases
    // Insert the cases into the database
    await Case.insertMany(cases);

    console.log("5 cases have been seeded successfully!");
  } catch (error) {
    console.error("Error seeding cases:", error);
  } finally {
    // Close the connection
    await disconnectDB();
  }
};

// Run the seed function
seedCases();
