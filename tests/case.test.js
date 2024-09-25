// tests/case.test.js
const request = require("supertest");
const app = require("../app"); // Import your Express app
const mongoose = require("mongoose");
const Case = require("../models/caseModel"); // Import case model if needed for setting up and cleaning test data

// Set up your MongoDB Atlas connection string in your .env file
const { MONGO_URI } = process.env;

// Mock authentication middleware
jest.mock("../middlewares/authMiddleware", () => ({
  authenticateLitigant: (req, res, next) => {
    req.user = { id: "testLitigantId" }; // Simulate authenticated litigant
    next();
  },
}));

describe("Case Routes", () => {
  // Close the database connection after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Connect to MongoDB Atlas before running tests
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  describe("POST /cases/add", () => {
    it("should create a new case", async () => {
      const newCase = {
        case_title: "Sample Case Title",
        case_description: "Detailed description of the case.",
        case_type: "Civil",
        filing_date: "2024-01-01",
        causeOfAction: "Property dispute",
        urgency_level: "High",
        case_status: "filed",
        defendantName: "John Doe",
        defendantContactEmail: "johndoe@example.com",
        defendantContactPhone: "1234567890",
        defendantAddress: "123 Defendant St",
        evidence_provided: "Photo evidence",
        witness_details: "Witness name and contact info",
      };
      const response = await request(app).post("/cases/add").send(newCase);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("case");
      expect(response.body.case).toHaveProperty(
        "case_title",
        newCase.case_title
      );
    });
  });

  describe("PUT /cases/update/:caseId", () => {
    it("should update the case details", async () => {
      const caseToUpdate = await Case.create({
        case_title: "Initial Case",
        case_description: "Initial description",
        case_type: "Criminal",
        filing_date: "2024-01-01",
        causeOfAction: "Theft",
        urgency_level: "Medium",
        defendantName: "Jane Doe",
        defendantContactEmail: "janedoe@example.com",
        defendantContactPhone: "0987654321",
        defendantAddress: "456 Defendant Rd",
        evidence_provided: "Evidence details",
        witness_details: "Witness details",
        litigant: "testLitigantId",
      });

      const updatedCase = {
        case_title: "Updated Case Title",
        case_description: "Updated case description",
      };

      const response = await request(app)
        .put(`/cases/update/${caseToUpdate._id}`)
        .send(updatedCase);

      expect(response.statusCode).toBe(200);
      expect(response.body.case).toHaveProperty(
        "case_title",
        updatedCase.case_title
      );
    });
  });

  describe("DELETE /cases/delete/:caseId", () => {
    it("should delete the case", async () => {
      const caseToDelete = await Case.create({
        case_title: "Delete This Case",
        case_description: "To be deleted",
        case_type: "Civil",
        filing_date: "2024-01-01",
        causeOfAction: "Contract breach",
        urgency_level: "Low",
        defendantName: "Alice Smith",
        defendantContactEmail: "alice@example.com",
        defendantContactPhone: "5555555555",
        defendantAddress: "789 Defendant Ave",
        evidence_provided: "Contract copy",
        witness_details: "Witness info",
        litigant: "testLitigantId",
      });

      const response = await request(app).delete(
        `/cases/delete/${caseToDelete._id}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Case deleted successfully");
    });
  });

  describe("PATCH /cases/updateStatus/:caseId", () => {
    it("should update the case status", async () => {
      const caseToUpdateStatus = await Case.create({
        case_title: "Update Status Case",
        case_description: "Status to be updated",
        case_type: "Civil",
        filing_date: "2024-01-01",
        causeOfAction: "Legal dispute",
        urgency_level: "Medium",
        defendantName: "Bob Brown",
        defendantContactEmail: "bob@example.com",
        defendantContactPhone: "3333333333",
        defendantAddress: "111 Defendant Blvd",
        evidence_provided: "Evidence details",
        witness_details: "Witness details",
        litigant: "testLitigantId",
      });

      const response = await request(app)
        .patch(`/cases/updateStatus/${caseToUpdateStatus._id}`)
        .send({ case_status: "accepted" });

      expect(response.statusCode).toBe(200);
      expect(response.body.case).toHaveProperty("case_status", "accepted");
    });
  });

  describe("GET /cases/:caseId", () => {
    it("should get the case details", async () => {
      const caseToGet = await Case.create({
        case_title: "Get This Case",
        case_description: "Retrieving case",
        case_type: "Civil",
        filing_date: "2024-01-01",
        causeOfAction: "Retrieval case",
        urgency_level: "High",
        defendantName: "Charlie Black",
        defendantContactEmail: "charlie@example.com",
        defendantContactPhone: "4444444444",
        defendantAddress: "234 Defendant Way",
        evidence_provided: "Evidence details",
        witness_details: "Witness details",
        litigant: "testLitigantId",
      });

      const response = await request(app).get(`/cases/${caseToGet._id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.case).toHaveProperty(
        "case_title",
        caseToGet.case_title
      );
    });
  });
});
