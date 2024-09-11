const Litigant = require("../models/litigant");
const jwtConfig = require("../config/jwtConfig");
const argon2 = require("argon2"); // Import Argon2 basically pass encryption sathi use kartoy
const { encrypt } = require("../utils/encryptionUtils");
const { handleFileUpload } = require("../utils/cloudinaryUploader");
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
      console.log("existingLitigant", existingLitigant._id);
      const securedId = encrypt(existingLitigant._id.toString());
      return res
        .status(400)
        .json({ error: "User already exists", id: securedId });
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

    const folderPath = `litigants/${litigant_id}`;

    // Log req.files to check both files are being uploaded
    console.log("req.files:", req.files);

    // Check if files are uploaded
    if (req.files) {
      // Handle profile image update
      if (req.files["profile"]) {
        const profileFile = req.files["profile"][0];

        // Validate file type for profile image (only accept images)
        if (!profileFile.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ error: "Invalid file type for profile image." });
        }

        // Upload new profile image
        try {
          litigant.litigant_profile = await handleFileUpload(
            profileFile,
            folderPath,
            "profile"
          );
        } catch (err) {
          return res
            .status(500)
            .json({ error: "Profile image upload failed." });
        }
      }

      // Handle Aadhaar document update
      if (req.files["aadhar"]) {
        const aadharFile = req.files["aadhar"][0];

        // Validate file type for Aadhaar (accept only images or PDFs)
        if (
          !(
            aadharFile.mimetype.startsWith("image/") ||
            aadharFile.mimetype === "application/pdf"
          )
        ) {
          return res
            .status(400)
            .json({ error: "Invalid file type for Aadhaar document." });
        }

        // Upload new Aadhaar document
        try {
          litigant.litigant_aadhar_proof = await handleFileUpload(
            aadharFile,
            folderPath,
            "aadhar"
          );
        } catch (err) {
          return res
            .status(500)
            .json({ error: "Aadhaar document upload failed." });
        }
      }

      // Handle other document update
      if (req.files["otherDocument"]) {
        const otherDocumentFile = req.files["otherDocument"][0];

        // Validate file type for other documents (only accept PDFs)
        if (otherDocumentFile.mimetype !== "application/pdf") {
          return res
            .status(400)
            .json({ error: "Invalid file type for other documents." });
        }

        // Upload new other document
        try {
          litigant.litigant_other_document = await handleFileUpload(
            otherDocumentFile,
            folderPath,
            "otherDocument"
          );
        } catch (err) {
          return res
            .status(500)
            .json({ error: "Other document upload failed." });
        }
      }
    }

    // Prevent updating the litigant email directly
    if (updates.litigant_email) {
      return res.status(400).json({
        error: "Email cannot be updated. For further changes, contact admin.",
      });
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


// Complete litigant profile
// const completeProfile = async (req, res) => {
//   const { litigant_id } = req.user; // Extract litigant ID from the JWT token
//   const updates = req.body; // Fields to update from the request body

//   try {
//     // Find the litigant by ID
//     const litigant = await Litigant.findById(litigant_id);
//     if (!litigant) {
//       return res.status(404).json({ error: "Litigant not found" });
//     }

//     const folderPath = `litigants/${litigant_id}`;

//     // Check if files are uploaded
//     if (req.files) {
//       console.log("req.files", req.files);

//       // List to hold all file upload promises
//       const fileUploadPromises = [];

//       // Handle profile image update
//       if (req.files["profile"]) {
//         const profileFile = req.files["profile"][0];

//         // Validate file type for profile image (only accept images)
//         if (!profileFile.mimetype.startsWith("image/")) {
//           return res
//             .status(400)
//             .json({ error: "Invalid file type for profile image." });
//         }

//         // Upload new profile image
//         fileUploadPromises.push(
//           handleFileUpload(profileFile, folderPath, "profile")
//             .then((url) => {
//               litigant.litigant_profile = url; // Update litigant profile URL
//             })
//             .catch((err) => {
//               throw new Error("Profile image upload failed.");
//             })
//         );
//       }

//       // Handle Aadhaar document update
//       if (req.files["aadhar"]) {
//         const aadharFile = req.files["aadhar"][0];

//         // Validate file type for Aadhaar (accept only images or PDFs)
//         if (
//           !(
//             aadharFile.mimetype.startsWith("image/") ||
//             aadharFile.mimetype === "application/pdf"
//           )
//         ) {
//           return res
//             .status(400)
//             .json({ error: "Invalid file type for Aadhaar document." });
//         }

//         // Upload new Aadhaar document
//         fileUploadPromises.push(
//           handleFileUpload(aadharFile, folderPath, "aadhar")
//             .then((url) => {
//               litigant.litigant_aadhar_proof = url; // Update litigant Aadhaar proof URL
//             })
//             .catch((err) => {
//               throw new Error("Aadhaar document upload failed.");
//             })
//         );
//       }

//       // Handle other document update
//       if (req.files["otherDocument"]) {
//         const otherDocumentFile = req.files["otherDocument"][0];

//         // Validate file type for other documents (only accept PDFs)
//         if (otherDocumentFile.mimetype !== "application/pdf") {
//           return res
//             .status(400)
//             .json({ error: "Invalid file type for other documents." });
//         }

//         // Upload new other document
//         fileUploadPromises.push(
//           handleFileUpload(otherDocumentFile, folderPath, "otherDocument")
//             .then((url) => {
//               litigant.litigant_other_document = url; // Update litigant other document URL
//             })
//             .catch((err) => {
//               throw new Error("Other document upload failed.");
//             })
//         );
//       }

//       // Wait for all file uploads to complete
//       await Promise.all(fileUploadPromises);
//     }

//     // Prevent updating the litigant email directly
//     if (updates.litigant_email) {
//       return res.status(400).json({
//         error: "Email cannot be updated. For further changes, contact admin.",
//       });
//     }

//     // Update other fields dynamically, except restricted fields like _id or litigant_email
//     Object.keys(updates).forEach((key) => {
//       if (key !== "_id" && key !== "litigant_email") {
//         litigant[key] = updates[key];
//       }
//     });

//     // Save the updated litigant profile
//     await litigant.save();

//     res.status(200).json({ message: "Profile updated successfully", litigant });
//   } catch (err) {
//     console.error("Error updating litigant profile:", err);
//     res.status(500).json({
//       error:
//         "An error occurred while updating the profile. Please try again later.",
//     });
//   }
// };



// const completeProfile = async (req, res) => {
//   const { litigant_id } = req.user; // Extract litigant ID from the JWT token
//   const updates = req.body; // Fields to update from the request body

//   try {
//     // Find the litigant by ID
//     const litigant = await Litigant.findById(litigant_id);
//     if (!litigant) {
//       return res.status(404).json({ error: "Litigant not found" });
//     }

//     // Handle profile image upload
//     if (req.files && req.files.litigant_profile) {
//       litigant.litigant_profile = await handleFileUpload(
//         req.files.litigant_profile[0], // Get the first file for litigant_profile
//         litigant_id,
//         'profile'
//       );
//     }

//     // Handle Aadhar proof upload
//     if (req.files && req.files.litigant_aadhar_proof) {
//       litigant.litigant_aadhar_proof = await handleFileUpload(
//         req.files.litigant_aadhar_proof[0], // Get the first file for litigant_aadhar_proof
//         litigant_id,
//         'aadhar'
//       );
//     }

//     // Handle other document upload
//     if (req.files && req.files.other_document) {
//       litigant.litigant_other_document = await handleFileUpload(
//         req.files.other_document[0], // Get the first file for other_document
//         litigant_id,
//         'otherDocument'
//       );
//     }

//     // Prevent updating the litigant email directly (requires admin intervention)
//     if (updates.litigant_email) {
//       return res.status(400).json({
//         error: "Email cannot be updated. For further changes, contact admin.",
//       });
//     }

//     // Update other fields dynamically
//     Object.keys(updates).forEach((key) => {
//       litigant[key] = updates[key];
//     });

//     // Save the updated litigant profile
//     await litigant.save();

//     // Send response after successful update
//     res.status(200).json({ message: "Profile updated successfully", litigant });
//   } catch (err) {
//     // Handle errors in image upload or saving the litigant profile
//     console.error("Error updating litigant profile:", err);
//     res.status(500).json({ error: "An error occurred while updating the profile. Please try again later." });
//   }
// };


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
};
