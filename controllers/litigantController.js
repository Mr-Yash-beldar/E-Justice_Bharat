const Litigant = require("../models/litigant");
const jwtConfig = require("../config/jwtConfig");
const argon2 = require("argon2"); // Import Argon2 basically pass encryption sathi use kartoy
const { encrypt } = require("../utils/encryptionUtils");
const calculateLitigantProfileCompletion = require("../utils/LitigantProfile/CalculateProfile");
const Advocate = require("../models/advocate");
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

// Get paginated cases for a litigant with optional status filtering
const getAllAdvocateByLitigant = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.litigant_id) {
      return res.status(403).json({ success: false, message: "Unauthorized access: user ID is required." });
    }

    // Get the litigant ID from req.user
    const litigantId = req.user.litigant_id;

    // Retrieve the litigant's location from the database
    const litigant = await Litigant.findById(litigantId).select("litigant_location");
    if (!litigant || !litigant.litigant_location) {
      return res.status(404).json({ success: false, message: "Litigant location not found." });
    }

    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Extract filters from query parameters
    const { name, rating, nearMe } = req.query;

    // Build the filter object
    let filter = {};

    if (name) {
      filter.fullName = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    if (rating) {
      filter.rating = { $gte: rating }; // Assuming rating is stored in the advocate model
    }

    // Use the litigant's location from the retrieved litigant document
    const litigantLocation = litigant.litigant_location.coordinates; // Expecting coordinates in [longitude, latitude] format

    if (nearMe === "true") {
      // Filter advocates within a 5 km radius of the litigant's location
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: litigantLocation
          },
          $maxDistance: 5000 // 5 km radius
        }
      };

      // Fetch advocates with pagination and filters
      const advocates = await Advocate.find(filter)
        .skip(skip)
        .limit(limit)
        .exec();

      // Get total count of advocates matching the filter
      const totalAdvocates = await Advocate.countDocuments(filter);
      const totalPages = Math.ceil(totalAdvocates / limit);

      // Response
      return res.status(200).json({
        success: true,
        advocates,
        pagination: {
          totalAdvocates,
          totalPages,
          currentPage: page,
          perPage: limit
        }
      });

    } else {
      // Fetch all advocates without the geospatial filter
      const advocates = await Advocate.find(filter)
        .skip(skip)
        .limit(limit)
        .exec();

      // Calculate distance for each advocate from litigant's location
      const advocatesWithDistance = advocates.map(advocate => {
        const distance = calculateDistance(
          litigantLocation[1], litigantLocation[0], // Litigant's latitude and longitude
          advocate.location.coordinates[1], advocate.location.coordinates[0] // Advocate's latitude and longitude
        );

        return {
          ...advocate.toObject(),
          distance // Add distance in kilometers
        };
      });

      // Sort by distance in ascending order
      advocatesWithDistance.sort((a, b) => a.distance - b.distance);

      // Get total count of advocates matching the filter
      const totalAdvocates = await Advocate.countDocuments(filter);
      const totalPages = Math.ceil(totalAdvocates / limit);

      // Response
      return res.status(200).json({
        success: true,
        advocates: advocatesWithDistance,
        pagination: {
          totalAdvocates,
          totalPages,
          currentPage: page,
          perPage: limit
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to calculate distance between two geo-coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;

  return R * 2 * Math.asin(Math.sqrt(a));
}








module.exports = {
  signup,
  completeProfile,
  authenticate,
  getLitigant,
  getAllAdvocateByLitigant,
};
