const express = require('express');
const { getdepositecode, createdepositcode, deleteDepositCode, searchDepositCodes, updateDepositCode, getDepositCodeById, getDepositCodes } = require('../controllers/depositecodecontroller');
const authenticateToken = require('../middleware/authMiddleware');


const depositcoderouter = express.Router();

depositcoderouter.get('/',authenticateToken,getDepositCodes);

// CRUD operations
depositcoderouter.post('/', authenticateToken,createdepositcode);
depositcoderouter.get('/:bid/:code',authenticateToken, getDepositCodeById);
depositcoderouter.put('/:bid/:code',authenticateToken, updateDepositCode);
depositcoderouter.delete('/:bid/:code',authenticateToken, deleteDepositCode);


module.exports = depositcoderouter;