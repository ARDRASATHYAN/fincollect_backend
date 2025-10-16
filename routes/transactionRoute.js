// routes/transactionrouter.js
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { getTransactionsByAgent, restoreTransaction } = require("../controllers/transactioncontoller");


const transactionrouter = express.Router();

transactionrouter.get("/:bid/:id", authenticateToken, getTransactionsByAgent);
transactionrouter.post('/restore/:bid/:id', authenticateToken, restoreTransaction);

module.exports = transactionrouter;
