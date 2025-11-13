const express = require("express");

const { getDashboardData } = require("../controllers/dashboardControllerjs");
const dashBoardRouter = express.Router();


// GET /dashboard
dashBoardRouter.get("/", getDashboardData);


module.exports = dashBoardRouter;
