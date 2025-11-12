const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { getAllBUser, getBUserById, createBUser, updateBUser, deleteBUser, searchBUser } = require('../controllers/buserController');
const buserRouter = express.Router();

buserRouter.get('/',authenticateToken, getAllBUser);
buserRouter.get('/:bid/:mobile',authenticateToken, getBUserById);
buserRouter.post('/',authenticateToken, createBUser);
buserRouter.put('/:bid/:mobile',authenticateToken, updateBUser);
buserRouter.delete('/:bid/:mobile',authenticateToken, deleteBUser);
buserRouter.get('/search/:term',authenticateToken,searchBUser);

module.exports = buserRouter;