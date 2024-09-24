const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    case_title: { type: String, required: true },
    case_description: { type: String, required: true },
    case_type: { type: String, required: true },
    filing_date: { type: Date, required: true },
    causeOfAction: { type: String, required: true },
    urgency_level: { type: String, required: true },
    case_status: { type: String,  default: "Filed" },
    defendantName: { type: String, required: true },
    defendantContactEmail: { type: String, required: true },
    defendantContactPhone: { type: String, required: true },
    defendantAddress: { type: String, required: true },
    evidence_provided: { type: String },
    witness_details: { type: String },
    litigantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Litigant",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
