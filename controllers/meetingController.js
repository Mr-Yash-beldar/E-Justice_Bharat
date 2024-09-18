const Meeting = require("../models/meeting");

exports.createMeeting = async (req, res) => {
  try {
    const roomId = await Meeting.createMeeting();
    res.json({ roomId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create meeting" });
  }
};

exports.validateMeeting = async (req, res) => {
  const { roomId } = req.params;
  try {
    const isValid = await Meeting.validateMeeting(roomId);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate meeting" });
  }
};
