// routes/transactionrouter.js
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { getTransactionsByAgent } = require("../controllers/transactioncontoller");


const transactionrouter = express.Router();

transactionrouter.get("/:bid/:id", authenticateToken, getTransactionsByAgent);

module.exports = transactionrouter;
