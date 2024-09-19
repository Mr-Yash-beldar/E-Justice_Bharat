// config/videoSDKConfig.js
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const apiKey = process.env.VIDEOSDK_API_KEY;
const baseUrl = process.env.API_BASE_URL;

// Directly return the API key for use in API requests
exports.getApiKey = () => apiKey;

// Export the base URL
exports.baseUrl = baseUrl;