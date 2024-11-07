// controllers/caseController.js
const Case = require("../models/cases"); // Adjust the path as needed

// Function to add a new case
exports.addCase = async (req, res) => {
  try {
    const {
      case_title,
      case_description,
      case_type,
      filing_date,
      causeOfAction,
      urgency_level,
      case_status,
      defendantName,
      defendantContactEmail,
      defendantContactPhone,
      defendantAddress,
      evidence_provided,
      witness_details,
    } = req.body;

    // Use req.user.id for litigantId
    const { litigant_id } = req.user; // Assuming req.user has been set by the authentication middleware

    const newCase = await Case.create({
      case_title,
      case_description,
      case_type,
      filing_date,
      causeOfAction,
      urgency_level,
      defendantName,
      defendantContactEmail,
      defendantContactPhone,
      defendantAddress,
      evidence_provided,
      witness_details,
      litigantId: litigant_id, // Set litigantId from authenticated user
    });

    return res.status(201).json({ success: true, case: newCase });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Update case details
exports.updateCase = async (req, res) => {
    try {
      const caseToUpdate = await Case.findById(req.params.caseId);
  
      if (!caseToUpdate) {
        return res.status(404).json({ success: false, message: "Case not found" });
      }
  
      // Allow update only if the case status is "Filed" or "Rejected"
      if (caseToUpdate.case_status !== "Filed" && caseToUpdate.case_status !== "Rejected") {
        return res.status(403).json({
          success: false,
          message: "Case can only be updated if its status is 'Filed' or 'Rejected'"
        });
      }
  
      // Proceed with the update if the condition is met
      const updatedCase = await Case.findByIdAndUpdate(
        req.params.caseId,
        req.body,
        { new: true, runValidators: true }
      );
  
      res.json({ success: true, message: "Case updated successfully", case: updatedCase });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// Delete a case
exports.deleteCase = async (req, res) => {
    try {
      const caseToDelete = await Case.findById(req.params.caseId);
  
      if (!caseToDelete) {
        return res.status(404).json({ success: false, message: "Case not found" });
      }
  
      // Allow deletion only if the case status is "Filed" or "Rejected"
      if (caseToDelete.case_status !== "Filed" && caseToDelete.case_status !== "Rejected") {
        return res.status(403).json({
          success: false,
          message: "Case can only be deleted if its status is 'Filed' or 'Rejected'"
        });
      }
  
      // Proceed with the deletion if the condition is met
      await Case.findByIdAndDelete(req.params.caseId);
      res.json({ success: true, message: "Case deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

// Function to update case status (for advocate response)
exports.updateCaseStatus = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    console.log("Updating case with ID:", caseId);
    console.log("New case status:", req.body.case_status);

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { case_status: req.body.case_status },
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      console.log("Case not found for ID:", caseId);
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    console.log("Updated case:", updatedCase);
    return res.json({ success: true, case: updatedCase });
  } catch (error) { 
    console.error("Error updating case status:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Function to get case details by ID
exports.getCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.caseId; // Get case ID from route parameters
    const caseDetails = await Case.findById(caseId).populate(
      "litigantId",
      "name email"
    );

    if (!caseDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    return res.json({ success: true, case: caseDetails });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


// Get paginated cases for a litigant with optional status filtering
exports.getAllCasesByLitigant = async (req, res) => {
  try {
    // Extract pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Extract status filter if provided, and split into an array
    const caseStatus = req.query.case_status ? req.query.case_status.split(',') : [];

    const { litigant_id } = req.user; // Assuming req.user has been set by the authentication middleware

    // Define the filter criteria
    const filter = { litigantId: litigant_id }; // Filter by authenticated litigant

    if (caseStatus.length > 0) {
      filter.case_status = { $in: caseStatus }; // Apply status filter using $in for multiple statuses
    }

    // Fetch cases with pagination and filter
    const cases = await Case.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of cases matching the filter (for all pages)
    const totalCases = await Case.countDocuments(filter);
    const totalPages = Math.ceil(totalCases / limit);

    // Response
    return res.status(200).json({
      success: true,
      cases,
      pagination: {
        totalCases,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

