const Litigant = require("../models/litigant");
const jwtConfig = require("../config/jwtConfig");
const argon2 = require("argon2"); // Import Argon2 basically pass encryption sathi use kartoy
const { encrypt } = require("../utils/encryptionUtils");
const calculateLitigantProfileCompletion = require("../utils/Profile/LitigantComplete");
const Advocate = require("../models/advocate");
const  calculateDistance  = require("../utils/GeoLocation/CalculateDistance");
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
      role: "litigant",
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
      litigant.litigant_location = {
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
  const { litigant_id, email } = req.user;

  try {
    let litigant;
    if (id) {
      litigant = await Litigant.findById(id);
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
      user:litigant,
      completionPercentage,
      profileStatus,
      isCompleted,
      missingFields,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//finding all advocate by litigant
const getAllAdvocateByLitigant = async (req, res) => {
  try {
    if (!req.user || !req.user.litigant_id) {
      return res.status(403).json({ success: false, message: "Unauthorized access: user ID is required." });
    }

    const litigantId = req.user.litigant_id;
    const litigant = await Litigant.findById(litigantId).select("litigant_location");
    if (!litigant || !litigant.litigant_location) {
      return res.status(404).json({ success: false, message: "Litigant location not found." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { name, rating, nearMe, specialization,location } = req.query;
    const litigantLocation = litigant.litigant_location.coordinates;

    let filter = {};

    if (specialization) {
      filter.specialization = { $elemMatch: { $regex: new RegExp(specialization, "i") } };
    }

    if (name) {
      filter.fullName = { $regex: new RegExp(name, "i") };
    }

    if(location){
      filter.place={ $regex:new RegExp(location,"i")};
    }



    if (rating) {
      filter.rating = { $gte: rating };
    }

    if (nearMe === "true") {
      filter.location = {
        $geoWithin: {
          $centerSphere: [litigantLocation, 4000 / 6378.1] // 5 km radius
        }
      };
    }

    const advocates = await Advocate.find(filter).exec();
    const totalAdvocates = await Advocate.countDocuments(filter);
    const totalPages = Math.ceil(totalAdvocates / limit);

    // Calculate distance for each advocate and add it to the response
    let advocatesWithDistance = advocates.map(advocate => {
      const advocateLocation = advocate.location.coordinates;
      const distance = calculateDistance(
        litigantLocation[1], litigantLocation[0], // Litigant's latitude and longitude
        advocateLocation[1], advocateLocation[0]  // Advocate's latitude and longitude
      );

      return {
        // id autoincremenet
        id: advocate._id,
        name: advocate.fullName,
        profilePicture: advocate.profileImage,
        email: advocate.email,
        mobile: advocate.mobileNumber,
        state: advocate.state,
        district: advocate.place,
        gender: 'Male', // Assuming you want to return a 
        language: advocate.status,
        location: advocate.place, // Assuming you want the full location or specific fields from it
        distance: distance.toFixed(2), // distance in kilometers, rounded to 2 decimal places
        specialization: advocate.specialization[0],
        ratings: 4.5 // Assuming you want to return a fixed rating for all advocates
      };
    });

    // Sort advocates by distance in ascending order if nearMe is true
    if (nearMe === "true") {
      advocatesWithDistance.sort((a, b) => a.distance - b.distance);
    }

    // Apply pagination after sorting by distance
    const paginatedAdvocates = advocatesWithDistance.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      advocates: paginatedAdvocates,
      pagination: { totalAdvocates, totalPages, currentPage: page, perPage: limit }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







module.exports = {
  signup,
  completeProfile,
  authenticate,
  getLitigant,
  getAllAdvocateByLitigant,
};
