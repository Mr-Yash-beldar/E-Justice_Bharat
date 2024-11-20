const CaseRequest = require("../models/caseRequestModel");
const Case = require("../models/cases");

module.exports = {
  // Create a new case request by litigant
  createRequest: async (req, res) => {
    const { caseId, advocateId } = req.body;
    const {litigant_id: litigantId} = req.user;
    try {
      const caseRecord = await Case.findById(caseId);
      if (!caseRecord) {
        return res.status(404).json({ error: "Case not found" });
      }

      // console.log(`CaseStatus: ${caseRecord.case_status}`);
      // Ensure the case status is eligible for requesting (rejected or filed only)
      if (!["rejected", "filed"].includes(caseRecord.case_status)) {
        return res.status(400).json({ error: "Case must have a 'rejected' or 'filed' status" });
      }

      // Update the case status to "requested" and save
      caseRecord.case_status = "requested";
      await caseRecord.save();

      const caseRequest = new CaseRequest({
        caseId,
        litigantId,
        advocateId
      });
      await caseRequest.save();
      res.status(201).json(caseRequest);
    } catch (error) {
      // console.log(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update request status, fee, and schedule (by advocate)
  updateRequest: async (req, res) => {
    const { requestId } = req.params;
    const { fee} = req.body;
    // console.log(requestId);
    try {
      const caseRecord = await  Case.findById(requestId);
      if (!caseRecord) {
        return res.status(404).json({ error: "Case request not found" });
      }

      // Update status, fee (if accepted), and pretrialSchedule (if registered)
     
      if(caseRecord.case_status !== "accepted" && !fee && fee<=0){
        return res.status(400).json({ error: "Can't apply fees, Something went Wrong" });
      }
      //get caserequest by caseId
      const caseRequest = await CaseRequest.findOne({caseId: requestId});
      caseRecord.case_status = "accepted";
      if(caseRequest.fee){
        return res.status(400).json({ error: "Fees already applied" });
      }
      caseRequest.fee = fee;
      await caseRecord.save();
      await caseRequest.save();
      res.json({message:"Case fees applied Successfully"});
    } catch (error) {
      // cosole.log(error);  
      res.status(500).json({ error: error.message });
    }
  },

  // Retrieve all requests made by a specific litigant
  getRequestsByCaseId: async (req, res) => {
     const { caseId } = req.body;
    try {
      const requests = await CaseRequest.findOne({ caseId:caseId });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Retrieve all requests made to a specific advocate
  getAdvocateRequests: async (req, res) => {
    const { advocate_id: advocateId } = req.user;
    //if advocageId is not provided take litigant_id from req.user and find all requests
      
    const { case_status: caseStatus } = req.query; // Assuming you receive `case_status` as a query parameter
  
    try {
      // Fetch case requests and populate related fields
      const caseRequests = await CaseRequest.find({ advocateId })
        .populate("caseId") // Fetch full case details
        .populate("litigantId"); // Fetch full litigant details
  
      // Filter the results by `case_status` if provided
      const filteredRequests = caseStatus
        ? caseRequests.filter((request) => request.caseId?.case_status === caseStatus)
        : caseRequests;
  
      res.json(filteredRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requested cases for this advocate" });
    }
  },
  // Retrieve all requests made to a specific advocate
  getLitigantRequests: async (req, res) => {
    const { litigant_id: litigantId } = req.user;
    //if advocageId is not provided take litigant_id from req.user and find all requests
      
    const { case_status: caseStatus } = req.query; // Assuming you receive `case_status` as a query parameter
  
    try {
      // Fetch case requests and populate related fields
      const caseRequests = await CaseRequest.find({ litigantId })
        .populate("caseId") // Fetch full case details
        .populate("advocateId"); // Fetch full litigant details
  
      // Filter the results by `case_status` if provided
      const filteredRequests = caseStatus
        ? caseRequests.filter((request) => request.caseId?.case_status === caseStatus)
        : caseRequests;
  
      res.json(filteredRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requested cases for this advocate" });
    }
  },
   setPretrialSchedule : async (req, res) => {
    const { requestId } = req.params;
    const { pretrialSchedule } = req.body;
  
    try {
      // Fetch the associated case request
      const caseRequest = await CaseRequest.findOne({ caseId: requestId });
      if (!caseRequest) {
        return res.status(404).json({ error: "Case request not found." });
      }
  
      // Check if the fee has been applied
      if (!caseRequest.fee || caseRequest.fee <= 0) {
        console.log("Fees not applied. Please apply the fee before scheduling.");
        return res
          .status(400)
          .json({ error: "Fees not applied. Please apply the fee before scheduling." });
      }
  
      // Check if the pretrial schedule is a valid future date
      if (!pretrialSchedule || new Date(pretrialSchedule) <= new Date()) {
        return res.status(400).json({ error: "Invalid pretrial schedule date. Must be in the future." });
      }
  
      // Update the pretrial schedule
      caseRequest.pretrialSchedule = pretrialSchedule;
  
      // Optionally update case status to "scheduled"
      const caseRecord = await Case.findById(requestId);
      if (caseRecord) {
        caseRecord.case_status = "scheduled";
        await caseRecord.save();
      }
  
      // Save the case request
      await caseRequest.save();
  
      res.json({ message: "Pretrial schedule set successfully." });
    } catch (error) {
      console.error("Error setting pretrial schedule:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
