const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const authenticateLitigant = require('../middlewares/authMiddleware'); // Import authentication middleware

// Route for adding a new case
router.post('/add', authenticateLitigant, caseController.addCase);

// Route for updating a case
router.put('/update/:caseId', authenticateLitigant, caseController.updateCase);

// Route for deleting a case
router.delete('/delete/:caseId', authenticateLitigant, caseController.deleteCase);

// Route for updating case status
router.patch('/updateStatus/:caseId', authenticateLitigant, caseController.updateCaseStatus);

// Route for getting case details
router.get('/:caseId', authenticateLitigant, caseController.getCaseDetails);

// Route for getting all cases by litigant
router.get("/", authenticateLitigant, caseController.getAllCasesByLitigant);

module.exports = router;
