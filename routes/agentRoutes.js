const express = require('express');
const { getAllAgents,createAgent,deleteAgent,updateAgent,getAgentById, searchAgents} = require('../controllers/agentcontroller');
const authenticateToken = require('../middleware/authMiddleware');
const agentRouter = express.Router();

agentRouter.get('/',authenticateToken, getAllAgents);
agentRouter.get('/:bid/:id',authenticateToken, getAgentById);
agentRouter.post('/',authenticateToken, createAgent);
agentRouter.put('/:bid/:id',authenticateToken, updateAgent);
agentRouter.delete('/:id',authenticateToken, deleteAgent);
agentRouter.get('/search/:term',authenticateToken,searchAgents);

module.exports = agentRouter;
