const express = require("express");
const router = express.Router();
const caseRequestController = require("../controllers/caseRequestController");
const verifyAuthToken = require("../middlewares/authMiddleware");

// Create a new case request (by litigant)  
router.post("/create",verifyAuthToken, caseRequestController.createRequest);

// Update request status, fee, and schedule (by advocate)
router.put("/applyFees/:requestId",verifyAuthToken, caseRequestController.updateRequest);

// Get all requests by a specific litigant
router.get("/getAll/", verifyAuthToken,caseRequestController.getAdvocateRequests);

//getdate of pretrial
router.post("/getDate/",caseRequestController.getRequestsByCaseId);

//pretrail schedule
router.post('/schedule/:requestId', verifyAuthToken,caseRequestController.setPretrialSchedule);

// Get all requests by a specific advocate
// router.get("/advocate/:advocateId", verifyAuthToken,caseRequestController.getRequestsByAdvocate);

module.exports = router;
