const Litigant = require("../models/litigant");
const argon2 = require("argon2"); // Import Argon2
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // id encryption sathi use kel aahe
const { encrypt } = require("../utils/encryptionUtils"); // assuming your utils file is named encryptionUtils.js
const { log } = require("console");

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
      return res.status(400).json({ error: "User already exists" });
    }

    const litigant = new Litigant({
      litigant_name,
      litigant_email,
      litigant_password,
      litigant_mob,
    });

    //send encrypted litigant_id in response
    const litigantId = litigant._id.toString();

    const securedEncryptedId = encrypt(litigantId);
    console.log("secureid", securedEncryptedId);

    await litigant.save();

    res.status(201).json({
      message: "Litigant registered successfully",
      securedEncryptedId,
    });
  } catch (err) {
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
      return res.status(400).json({ message: "Email not verified." });
    }

    const token = jwt.sign(
      { id: litigant._id, email: litigant.litigant_email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ token, litigant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete profile of a litigant
const completeProfile = async (req, res) => {
  const { litigant_id } = req.user; // Assuming user ID is obtained from the JWT
  const updates = req.body;

  try {
    const litigant = await Litigant.findById(litigant_id);
    if (!litigant) {
      return res.status(404).json({ error: "Litigant not found" });
    }

    // Update only the fields provided in the request body
    Object.keys(updates).forEach((key) => {
      if (litigant[key] !== undefined) {
        litigant[key] = updates[key];
      }
    });

    await litigant.save();
    res.status(200).json({ message: "Profile updated successfully", litigant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all litigants
const getLitigants = async (req, res) => {
  try {
    const litigants = await Litigant.find();
    res.status(200).json(litigants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific litigant by ID or email
const getLitigant = async (req, res) => {
  const { id, email } = req.params;

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

    res.status(200).json(litigant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  completeProfile,
  authenticate,
  getLitigants,
  getLitigant,
};
