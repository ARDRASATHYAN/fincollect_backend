const express = require("express");

const { getDashboardData } = require("../controllers/dashboardController");
const authenticateToken = require("../middleware/authMiddleware");
const dashBoardRouter = express.Router();


// GET /dashboard
dashBoardRouter.get("/",authenticateToken, getDashboardData);


module.exports = dashBoardRouter;
