// routes/fileRoutes.js
const express = require("express");
const router = express.Router();
const {
  uploadProfile,
  uploadAadhaar,
  uploadOtherDocument,
} = require("../controllers/fileController");
const uploadFields = require("../middlewares/uploadMiddleware");
const authenticateToken = require("../middlewares/authMiddleware");

// Profile Image Upload Route
router.put(
  "/upload/:modelType/profile",
  authenticateToken,
  uploadFields,
  uploadProfile
);

// Aadhaar Document Upload Route
router.put(
  "/upload/:modelType/aadhaar",
  authenticateToken,
  uploadFields,
  uploadAadhaar
);

// Other Document Upload Route
router.put(
  "/upload/:modelType/otherDocument",
  authenticateToken,
  uploadFields,
  uploadOtherDocument
);

module.exports = router;
