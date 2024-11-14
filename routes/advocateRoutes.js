const express = require("express");
const router = express.Router();
const advocateController = require("../controllers/advocateController");
const verifyToken = require("../middlewares/authMiddleware"); // Middleware to verify JWT

// Route for signing up a new advocate
router.post("/signup", advocateController.signup);

// Route for authenticating an advocate and generating JWT
router.post("/authenticate", advocateController.authenticate);

// Route for completing advocate profile (requires authentication)
router.put("/completeProfile", verifyToken, advocateController.completeProfile);

// Route for getting a list of all advocates
router.get("/getDetails", verifyToken,advocateController.getAdvocate);

module.exports = router;
