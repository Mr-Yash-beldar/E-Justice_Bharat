const cloudinary = require("../config/cloudinaryConfig");

// Function to handle Cloudinary upload
const uploadImageToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);  // Resolve with the result from Cloudinary 
      }
    );

    uploadStream.end(fileBuffer); // End the stream and send the file buffer
  });
};

// Function to handle file uploads for a specific litigant
const handleFileUpload = async (file, folderPath, fileType) => {
  const folder = folderPath; // Use litigantId as the folder name
  try {
    const result = await uploadImageToCloudinary(file.buffer, {
      folder,
      public_id: `${fileType}_${Date.now()}`, // Use fileType and timestamp for unique public_id
      resource_type: file.mimetype.startsWith("image") ? "image" : "raw", // Handle image or non-image files (e.g., PDFs)
      overwrite: true,
    });
    return result.secure_url; // Return the secure URL from Cloudinary
  } catch (error) {
    console.error(`Failed to upload ${fileType} to Cloudinary:`, error);
    throw new Error(`Failed to upload ${fileType}. Please try again.`);
  }
};

module.exports = { handleFileUpload };
