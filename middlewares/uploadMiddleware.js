const multer = require("multer");

// Configure multer to store files temporarily in memory or on disk
const storage = multer.memoryStorage(); // or multer.diskStorage({...})

// Configure multer to store files in memory before processing
const upload = multer({
    storage: storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // Set size limits if needed
  });
  
  // Middleware to handle single or multiple file uploads
  const uploadFields = upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'otherDocument', maxCount: 1 },
  ]);

module.exports = uploadFields;