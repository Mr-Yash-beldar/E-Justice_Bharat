const { connectDB, disconnectDB } = require('../config/db');
const Litigant = require('../models/litigant');
const faker = require('faker'); // for fake data generationcls

//validate genders
const validGenders = ['Male', 'Female', 'Other'];
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];


const generateFakeLitigants = (num) => {
  const litigants = [];
  for (let i = 0; i < num; i++) {
    litigants.push({
      litigant_name: faker.name.findName(),
      litigant_profile: faker.internet.avatar(),
      litigant_state: faker.address.state(),
      litigant_district: faker.address.city(),
      litigant_gender: getRandomElement(validGenders),
      litigant_dob: faker.date.past(30, '2000-01-01'),
      litigant_mob: faker.phone.phoneNumber('##########'),
      litigant_email: faker.internet.email(),
      litigant_lat: parseFloat(faker.address.latitude()),
      litigant_lang: parseFloat(faker.address.longitude()),
      litigant_password: faker.internet.password(),
      litigant_passkey: faker.random.alphaNumeric(16),
      litigant_otp: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
      litigant_drivers_licence: faker.random.alphaNumeric(10),
      litigant_aadhar_proof: faker.random.alphaNumeric(12),
      litigant_contact_details: faker.phone.phoneNumber(),
      litigant_pincode: faker.address.zipCode('######')
    });
  }
  return litigants;
};

const seedLitigants = async () => {
  await connectDB();
  
  const numLitigants = 5; // Number of fake litigants to generate
  const litigants = generateFakeLitigants(numLitigants);

  try {
    await Litigant.deleteMany(); // Clear existing data
    await Litigant.insertMany(litigants); // Insert sample data
    console.log('Litigants seeded successfully');
  } catch (err) {
    console.error('Error seeding litigants:', err.message);
  } finally {
    await disconnectDB(); // Ensure proper disconnection
  }
};

seedLitigants();
