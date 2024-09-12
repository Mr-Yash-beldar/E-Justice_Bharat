const Litigant = require("../models/litigant");
const jwtConfig = require('../config/jwtConfig');
const argon2 = require("argon2"); // Import Argon2 basically pass encryption sathi use kartoy
const multer = require("multer");
const crypto = require("crypto"); // id encryption sathi use kel aahe
const { encrypt } = require("../utils/encryptionUtils");
const { uploadImageToCloudinary } = require("../utils/cloudinaryUploader");


// Configure multer to handle file uploads jo cloudinary la photo upload karnun deyil
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("litigant_profile");

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
      console.log("existingLitigant", existingLitigant._id);
      const securedId = encrypt(existingLitigant._id.toString());
      return res.status(400).json({ error: "User already exists" ,id:securedId});
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
  
    //  payload for the token which contains id and email
    const payload = {
      id: litigant._id,
      email: litigant.litigant_email,
    };

    // Generate JWT token
    const token = jwtConfig.signToken(payload);
   
    

    res.status(200).json({ token, litigant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete profile of a litigant basically update kara
const completeProfile = async (req, res) => {
  const { litigant_id } = req.user; //jo  jwt token header madhe id ahe to extract kara
  const updates = req.body;

  try {
    const litigant = await Litigant.findById(litigant_id);
    if (!litigant) {
      return res.status(404).json({ error: "Litigant not found" });
    }

    // jar photo file send keli asel tr cloudinary la upload kara
    if (req.file) {
      const result = await uploadImageToCloudinary(req.file.buffer, {
        folder: "litigants",
        public_id: `profile_${litigant_id}`,
        overwrite: true,
      });

      litigant.litigant_profile = result.secure_url;
    }

    // Update other fields
    Object.keys(updates).forEach((key) => {
      //if tries to update email show error cause email verification is dones
      if (key === "litigant_email") {
        return res.status(400).json({ error: "Email cannot be updated ,For further changes contact admin" });
      }
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

    res.status(200).json(litigant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  completeProfile,
  authenticate,
  getLitigant,
  upload,
};
