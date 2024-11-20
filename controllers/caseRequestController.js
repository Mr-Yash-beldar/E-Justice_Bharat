const CaseRequest = require("../models/caseRequestModel");
const Case = require("../models/caseModel");

module.exports = {
  createRequest: async (req, res) => {
    const { caseId, litigantId, advocateId } = req.body;
    try {
      const caseRecord = await Case.findById(caseId);
      if (!caseRecord) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Ensure the case status is eligible for requesting (rejected or requested only)
      if (!["rejected", "filed"].includes(caseRecord.status)) {
        return res.status(400).json({ error: "Case must have a 'rejected' or 'filed' status" });
      }

      const caseRequest = new CaseRequest({
        caseId,
        litigantId,
        advocateId,
        status: "requested"
      });
      await caseRequest.save();
      res.status(201).json(caseRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update request status, fee, and schedule (by advocate)
  updateRequest: async (req, res) => {
    const { requestId } = req.params;
    const { status, fee, pretrialSchedule } = req.body;
    try {
      const caseRequest = await CaseRequest.findById(requestId);
      if (!caseRequest) {
        return res.status(404).json({ error: "Case request not found" });
      }

      // Update status, fee (if accepted), and pretrialSchedule (if registered)
      caseRequest.status = status || caseRequest.status;
      caseRequest.fee = status === "accepted" ? fee : caseRequest.fee;
      caseRequest.pretrialSchedule = status === "registered" ? pretrialSchedule : caseRequest.pretrialSchedule;

      await caseRequest.save();
      res.json(caseRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Retrieve all requests made by a specific litigant
  getRequestsByLitigant: async (req, res) => {
    const { litigantId } = req.params;
    try {
      const requests = await CaseRequest.find({ litigantId }).populate("caseId advocateId");
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Retrieve all requests made to a specific advocate
  getRequestsByAdvocate: async (req, res) => {
    const { advocateId } = req.params;
    try {
      const requests = await CaseRequest.find({ advocateId }).populate("caseId litigantId");
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
