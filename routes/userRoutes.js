const express = require("express");
const { getUsers, getUser, createUser, updateUser, deleteUser, login, refreshToken, requestPasswordReset, resetPassword } = require("../controllers/userController");
const userrouter = express.Router();


userrouter.get("/",getUsers);
userrouter.get("/:id", getUser);      
userrouter.post("/", createUser);     
userrouter.put("/:id", updateUser);    
userrouter.delete("/:email", deleteUser); 
userrouter.post("/login", login);
userrouter.post("/refresh-token", refreshToken);

userrouter.post("/forgot-password", requestPasswordReset);
userrouter.post("/reset-password", resetPassword);

module.exports = userrouter;
