const express = require("express");
const { login, refreshToken, requestPasswordReset, resetPassword } = require("../controllers/authController");
const authrouter = express.Router();


authrouter.post("/login", login);
authrouter.post("/refresh-token", refreshToken);
authrouter.post("/forgot-password", requestPasswordReset);
authrouter.post("/reset-password", resetPassword);
module.exports = authrouter;
