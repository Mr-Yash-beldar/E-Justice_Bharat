const Meeting = require("../models/meeting");
const Meet=require('../models/meetingModel')
const Case = require("../models/cases"); // Assuming you have a Case model

exports.storeMeeting = async (req, res) => {
  const { caseId, meetingCode } = req.body;

  // Validate input
  if (!caseId || !meetingCode) {
    return res
      .status(400)
      .json({ error: "caseId and meetingCode are required" });
  }

  try {
    // Check if the case exists
    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check if the meeting code already exists
    const existingMeeting = await Meet.findOne({ caseId });
    if (existingMeeting) {
      return res.status(400).json({ error: "Meeting  already exists" });
    }

    // Create and save the new meeting
    const newMeeting = new Meet({ caseId, meetingCode });
    await newMeeting.save();

    res.status(201).json({
      message: "Meeting created successfully",
      meeting: newMeeting,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create meeting", details: error.message });
  }
};

exports.getMeetingCodeByCaseId = async (req, res) => {
  const { caseId } = req.body;
  
  // Validate input
  if (!caseId) {
    return res.status(400).json({ error: "caseId is required" });
  }

  try {
    // Find the meeting by caseId
    const meeting = await Meet.findOne({ caseId });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found for this case" });
    }

    res.status(200).json({
      message: "Meeting found successfully",
      meetingCode: meeting.meetingCode,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve meeting", details: error.message });
  }
};

exports.createMeeting = async (req, res) => {
  try {
    const roomId = await Meeting.createMeeting();
    res.json({ roomId });
  } catch (error) {
    console.log(error);
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
