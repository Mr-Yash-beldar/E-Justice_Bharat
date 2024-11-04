// controllers/fileController.js
const Litigant = require("../models/litigant");
const Advocate = require("../models/advocate");
const { handleFileUpload } = require("../utils/cloudinaryUploader");

const getModelAndId = (modelType, user) => {
  switch (modelType) {
    case "advocate":
      return { Model: Advocate, userId: user.advocate_id };
    case "litigant":
      return { Model: Litigant, userId: user.litigant_id };
    default:
      throw new Error("Invalid model type");
  }
};

const uploadProfile = async (req, res) => {
  const { modelType } = req.params;
  const { Model, userId } = getModelAndId(modelType, req.user);

  try {
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ error: `${modelType} not found` });

    // Check if the file is uploaded and validate the file type
    if (!req.files || !req.files["profile_image"]) {
      return res.status(400).json({ error: "Profile image file is required." });
    }

    const profileFile = req.files["profile_image"][0];

    // Log for debugging file type
    // console.log("Uploaded file mimetype:", profileFile.mimetype);

    // Check if the file is an image
    if (!profileFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Invalid file type for profile image." });
    }

    const folderPath = `${modelType}s/${userId}/profile`;
    user.profile_image = await handleFileUpload(profileFile, folderPath, "profile");
    await user.save();

    res.status(200).json({ message: "Profile image updated successfully", user });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: error.message || "Profile image upload failed." });
  }
};

// Upload Aadhaar Document
const uploadAadhaar = async (req, res) => {
  const { modelType } = req.params;
  const { Model, userId } = getModelAndId(modelType, req.user);

  try {
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ error: `${modelType} not found` });

    // Check if file is uploaded
    if (!req.files || !req.files["aadhar_document"]) {
      return res.status(400).json({ error: "Aadhar file is required." });
    }

    const aadhaarFile = req.files["aadhar_document"][0];

    // Validate the file type (image or PDF)
    if (!(aadhaarFile.mimetype.startsWith("image/") || aadhaarFile.mimetype === "application/pdf")) {
      return res.status(400).json({ error: "Invalid file type for Aadhaar document." });
    }

    const folderPath = `${modelType}s/${userId}/aadhaar`;
    user.aadhar_document = await handleFileUpload(aadhaarFile, folderPath, "aadhaar");
    await user.save();

    res.status(200).json({ message: "Aadhaar document updated successfully", user });
  } catch (error) {
    console.error("Error uploading Aadhaar document:", error);
    res.status(500).json({ error: error.message || "Aadhaar document upload failed." });
  }
};


// Upload Other Document
const uploadOtherDocument = async (req, res) => {
  const { modelType } = req.params;
  const { Model, userId } = getModelAndId(modelType, req.user);

  try {
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ error: `${modelType} not found` });

    // Check if the 'other_document' file is uploaded
    if (!req.files || !req.files["other_document"]) {
      return res.status(400).json({ error: "Document file is required." });
    }

    const otherFile = req.files["other_document"][0];

    // Log for debugging file type
    // console.log("Uploaded file mimetype:", otherFile.mimetype);

    // Validate the file type (image or PDF)
    if (!(otherFile.mimetype.startsWith("image/") || otherFile.mimetype === "application/pdf")) {
      return res.status(400).json({ error: "Invalid file type for document." });
    }

    const folderPath = `${modelType}s/${userId}/documents`;
    user.other_document = await handleFileUpload(otherFile, folderPath, "document");
    await user.save();

    res.status(200).json({ message: "Other document updated successfully", user });
  } catch (error) {
    console.error("Error uploading other document:", error);
    res.status(500).json({ error: error.message || "Other document upload failed." });
  }
};


module.exports = {
  uploadProfile,
  uploadAadhaar,
  uploadOtherDocument,
};
