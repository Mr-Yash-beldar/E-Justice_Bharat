const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const verifyAuthToken = require('../middlewares/authMiddleware'); // Import authentication middleware

// Route for adding a new case
router.post('/add', verifyAuthToken, caseController.addCase);

// Route for updating a case
router.put('/update/:caseId', verifyAuthToken, caseController.updateCase);

// Route for deleting a case
router.delete('/delete/:caseId', verifyAuthToken, caseController.deleteCase);

// Route for updating case status
router.patch('/updateStatus/:caseId', verifyAuthToken, caseController.updateCaseStatus);

// Route for getting case details
router.get('/:caseId', verifyAuthToken, caseController.getCaseDetails);

// Route for getting all cases by litigant
router.get("/", verifyAuthToken, caseController.getAllCasesByLitigant);

module.exports = router;
