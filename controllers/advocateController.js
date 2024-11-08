const Advocate = require("../models/advocate");
const jwtConfig = require("../config/jwtConfig");
const argon2 = require("argon2");
const { encrypt } = require("../utils/encryptionUtils");
const calculateAdvocateProfileCompletion = require("../utils/Profile/AdvocateComplete");
const { formatDateToYYYYMMDD } = require('../utils/dateUtils');

// Add a new advocate (Signup)
const signup = async (req, res) => {
  const {
    fullName,
    email,
    password,
    mobileNumber,
    confirmPassword,
    barLicenseNumber
  } = req.body;

  try {
    // Check if advocate already exists
    const existingAdvocate = await Advocate.findOne({ email });
    if (existingAdvocate) {
      return res.status(409).json({ error: "Advocate already exists" });
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    const advocate = new Advocate({
      fullName,
      barLicenseNumber,
      email,
      mobileNumber,
      password: hashedPassword
    });

    // Encrypt the advocate ID
    const securedEncryptedId = encrypt(advocate._id.toString());

    await advocate.save();

    res.status(201).json({
      message: "Advocate registered successfully",
      id: securedEncryptedId, // Send the encrypted ID in the response
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Authenticate advocate and generate JWT
const authenticate = async (req, res) => {
  const { email, password } = req.body;

  try {
    const advocate = await Advocate.findOne({ email });
    // console.log(advocate);

    // If advocate is not found or password is incorrect
    if (!advocate || !(argon2.verify(advocate.password, password))) {

      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if the email is verified (if applicable)
    if (!advocate.isVerified) {
      const securedEncryptedId = encrypt(advocate._id.toString());
      return res.status(409).json({ message: "Email not verified.", id: securedEncryptedId });
    }

    // Payload for the token which contains id and email
    const payload = {
      advocate_id: advocate._id,
      email: advocate.email,
      role: "advocate",
    };

    // Generate JWT token
    const token = jwtConfig.signToken(payload);

    res.status(200).json({ token, advocate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete advocate profile with profile completion calculation
const completeProfile = async (req, res) => {
  const { advocate_id } = req.user; // Extract advocate ID from the JWT token
  const updates = req.body; // Fields to update from the request body

  try {
    // Find the litigant by ID
    const advocate = await Advocate.findById(advocate_id);
    if (!advocate) {
      return res.status(404).json({ error: "Advocate not found" });
    }

    // Prevent updating the litigant email directly
    if (updates.email) {
      return res.status(400).json({
        error: "Email cannot be updated.",
      });
    }

    // Check for latitude and longitude in updates
    if (updates.advocate_lat !== undefined && updates.advocate_long !== undefined) {
      advocate.advocate_location = {
        type: 'Point',
        coordinates: [updates.advocate_long, updates.advocate_lat] // [longitude, latitude]
      };
      delete updates.advocate_lat; // Remove lat from updates after processing
      delete updates.advocate_long; // Remove long from updates after processing
    }

    // Update other fields dynamically, except restricted fields like _id or litigant_email
    Object.keys(updates).forEach((key) => {
      if (key !== "_id" && key !== "litigant_email") {
        advocate[key] = updates[key];
      }
    });

    // Save the updated litigant profile
    await advocate.save();

    res.status(200).json({ message: "Profile updated successfully", advocate });
  } catch (err) {
    console.error("Error updating advocate profile:", err);
    res.status(500).json({
      error:
        "An error occurred while updating the profile. Please try again later.",
    });
  }
};


// Get  advocate details
const getAdvocate = async (req, res) => {
  // const { id, email } = req.params;
  //verify the user jwt token hearder and extract the id from it
  const { advocate_id } = req.user;

  try {
    let advocate;
    if (advocate_id) {
      advocate = await Advocate.findById(advocate_id);
    } else {
      return res
        .status(400)
        .json({ error: "Please provide either an ID or an email" });
    }

    if (!advocate) {
      return res.status(404).json({ error: "Advocate not found" });
    }

    const profile = calculateAdvocateProfileCompletion(advocate);
    const completionPercentage = profile.completionPercentage;
    const missingFields = profile.missingFields;
    const profileStatus = completionPercentage == 100 ? 'completed' : 'not completed';
    const isCompleted = completionPercentage == 100;

    res.status(200).json({
      message: "Advocate Details",
      user:advocate,
      completionPercentage,
      profileStatus,
      isCompleted,
      missingFields,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  authenticate,
  completeProfile,
  getAdvocate
};
  