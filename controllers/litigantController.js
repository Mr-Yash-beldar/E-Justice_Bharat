const Litigant = require("../models/litigant");
const jwtConfig = require("../config/jwtConfig");
const argon2 = require("argon2"); // Import Argon2 basically pass encryption sathi use kartoy
const { encrypt } = require("../utils/encryptionUtils");
const calculateLitigantProfileCompletion = require("../utils/LitigantProfile/CalculateProfile");
// const { checkIfAadhaar } = require('../utils/AadharValidation/imagevalidate'); // Image validation utility

// Add a new litigant (Signup)
const signup = async (req, res) => {
  const {
    litigant_name,
    litigant_email,
    litigant_password,
    litigant_confirm_password,
    litigant_mob,
  } = req.body;

  try {
    // Check if user already exists
    const existingLitigant = await Litigant.findOne({ litigant_email });
    if (existingLitigant) {
      return res.status(409).json({ error: "User already exists" });
    }

    const litigant = new Litigant({
      litigant_name,
      litigant_email,
      litigant_password,
      litigant_mob,
    });
    // Encrypt the litigant ID
    const securedEncryptedId = encrypt(litigant._id.toString());

    await litigant.save();

    res.status(201).json({
      message: "Litigant registered successfully",
      id: securedEncryptedId, // Send the encrypted ID in the response
    });
  } catch (err) {
    console.error("Error in signup function:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Authenticate user and generate JWT
const authenticate = async (req, res) => {
  const { litigant_email, litigant_password } = req.body;

  try {
    const litigant = await Litigant.findOne({ litigant_email });

    // If litigant is not found or password is incorrect
    if (
      !litigant ||
      !(await argon2.verify(litigant.litigant_password, litigant_password))
    ) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    if (!litigant.isVerified) { 
      const securedEncryptedId = encrypt(litigant.id.toString());
      // console.log("securedEncryptedId", securedEncryptedId);
      return res
        .status(409)
        .json({ message: "Email not verified.", id: securedEncryptedId });
    }

    //  payload for the token which contains id and email
    const payload = {
      litigant_id: litigant._id,
      email: litigant.litigant_email,
    };

    // Generate JWT token
    const token = jwtConfig.signToken(payload);

    res.status(200).json({ token, litigant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete litigant profile
const completeProfile = async (req, res) => {
  const { litigant_id } = req.user; // Extract litigant ID from the JWT token
  const updates = req.body; // Fields to update from the request body

  try {
    // Find the litigant by ID
    const litigant = await Litigant.findById(litigant_id);
    if (!litigant) {
      return res.status(404).json({ error: "Litigant not found" });
    }

    // Prevent updating the litigant email directly
    if (updates.litigant_email) {
      return res.status(400).json({
        error: "Email cannot be updated. For further changes, contact admin.",
      });
    }

    // Check for latitude and longitude in updates
    if (updates.litigant_lat !== undefined && updates.litigant_long !== undefined) {
      litigant.location = {
        type: 'Point',
        coordinates: [updates.litigant_long, updates.litigant_lat] // [longitude, latitude]
      };
      delete updates.litigant_lat; // Remove lat from updates after processing
      delete updates.litigant_long; // Remove long from updates after processing
    }
    
    // Update other fields dynamically, except restricted fields like _id or litigant_email
    Object.keys(updates).forEach((key) => {
      if (key !== "_id" && key !== "litigant_email") {
        litigant[key] = updates[key];
      }
    });

    // Save the updated litigant profile
    await litigant.save();

    res.status(200).json({ message: "Profile updated successfully", litigant });
  } catch (err) {
    console.error("Error updating litigant profile:", err);
    res.status(500).json({
      error:
        "An error occurred while updating the profile. Please try again later.",
    });
  }
};

// Get a specific litigant by ID or email
const getLitigant = async (req, res) => {
  // const { id, email } = req.params;
  //verify the user jwt token hearder and extract the id from it
  const { id, email } = req.user;

  try {
    let litigant;
    if (id) {
      litigant = await Litigant.findById(id);
    } else if (email) {
      litigant = await Litigant.findOne({ litigant_email: email });
    } else {
      return res
        .status(400)
        .json({ error: "Please provide either an ID or an email" });
    }

    if (!litigant) {
      return res.status(404).json({ error: "Litigant not found" });
    }

    const profile = calculateLitigantProfileCompletion(litigant);
    const completionPercentage = profile.completionPercentage;
    const missingFields = profile.missingFields;
    const profileStatus = completionPercentage == 100 ? 'completed' : 'not completed';
    const isCompleted = completionPercentage == 100;

    res.status(200).json({
      message: "Litigant Details",
      litigant,
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
  completeProfile,
  authenticate,
  getLitigant,
};
