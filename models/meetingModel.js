const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
      caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case", // Assuming there's a Case model
        required: true,
      },
      meetingCode: {
        type: String,
        required: true,
        unique: true, // Ensures meeting codes are unique
      },
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
  );
  
  module.exports = mongoose.model("Meet", meetingSchema);