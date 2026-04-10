const dotenv = require("dotenv");

dotenv.config();

const apiKey = process.env.VIDEOSDK_API_KEY;
const baseUrl = process.env.API_BASE_URL;

exports.getApiKey = () => apiKey;

exports.baseUrl = baseUrl;
