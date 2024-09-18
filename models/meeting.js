const axios = require("axios");
const { getApiKey, baseUrl } = require("../config/videoSDKConfig");

// Create a new meeting
exports.createMeeting = async () => {
  try {
    const apiKey = getApiKey();
    const { data } = await axios.post(
      `${baseUrl}/v2/rooms`,
      {},
      {
        headers: {
          Authorization: apiKey,  // Use API key directly here
          "Content-Type": "application/json",
        },
      }
    );
    return data.roomId;
  } catch (error) {
    throw new Error("Failed to create meeting: " + error.message);
  }
};


// Validate a meeting ID
exports.validateMeeting = async (roomId) => {
  try {
    const apiKey = getApiKey();
    const { data } = await axios.get(
      `${baseUrl}/v2/rooms/validate/${roomId}`,
      {
        headers: {
          Authorization: apiKey,  // Use API key directly here
          "Content-Type": "application/json",
        },
      }
    );
    return data.roomId === roomId;
  } catch (error) {
    throw new Error("Failed to validate meeting: " + error.message);
  }
};
