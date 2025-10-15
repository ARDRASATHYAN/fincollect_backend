const express = require('express');
const { addBank, getBanks, deleteBank, updateBank, searchBanks ,getBankById} = require('../controllers/bankcontrollers');
const authenticateToken = require('../middleware/authMiddleware');

const bankrouter = express.Router();


bankrouter.post('/',authenticateToken, addBank);
bankrouter.get('/',authenticateToken, getBanks);
bankrouter.get('/search/:term', searchBanks); // ✅ move above /:id
bankrouter.get('/:id',authenticateToken, getBankById);
bankrouter.delete('/:id',authenticateToken, deleteBank);
bankrouter.put('/:id',authenticateToken, updateBank);


module.exports = bankrouter;
