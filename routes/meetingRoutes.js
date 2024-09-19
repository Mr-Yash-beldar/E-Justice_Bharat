const express = require("express");
const router = express.Router();
const videoController = require("../controllers/meetingController");

// Route to create a meeting
router.post("/create-meeting", videoController.createMeeting);

// Route to validate a meeting by roomId
router.get("/validate-meeting/:roomId", videoController.validateMeeting);

module.exports = router;
