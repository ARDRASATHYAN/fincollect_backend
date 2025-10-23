const express = require("express");
const { getUsers, getUser, createUser, updateUser, deleteUser, login, refreshToken, requestPasswordReset, resetPassword } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const userrouter = express.Router();


userrouter.get("/",authenticateToken,getUsers);
userrouter.get("/:id",authenticateToken, getUser);      
userrouter.post("/",authenticateToken, createUser);     
userrouter.put("/:id",authenticateToken, updateUser);    
userrouter.delete("/:email",authenticateToken,deleteUser); 
userrouter.post("/login", login);
userrouter.post("/refresh-token", refreshToken);

userrouter.post("/forgot-password", requestPasswordReset);
userrouter.post("/reset-password", resetPassword);

module.exports = userrouter;
