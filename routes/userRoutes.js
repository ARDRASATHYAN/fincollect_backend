const express = require("express");
const { getUsers, getUser, createUser, updateUser, deleteUser, login, refreshToken, requestPasswordReset, resetPassword } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const userrouter = express.Router();


userrouter.get("/",authenticateToken,getUsers);
userrouter.get("/:id",authenticateToken, getUser);      
userrouter.post("/",authenticateToken, createUser);     
userrouter.put("/:id",authenticateToken, updateUser);    
userrouter.delete("/:email",authenticateToken,deleteUser); 


module.exports = userrouter;
