const mongoose = require("mongoose");

const caseRequestSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true  
  },
  litigantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Litigant",
    required: true
  },
  advocateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advocate",
    required: true
  },
  fee: {
    type: Number,
  },
  pretrialSchedule: {
    type: Date, 
  }
}, { timestamps: true });

module.exports = mongoose.model("CaseRequest", caseRequestSchema);
