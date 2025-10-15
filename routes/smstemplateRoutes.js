const express = require('express');
const { getSmsTemplate, addSmsTemplate, getSmsTemplateById, deleteSmsTemplate, searchSmsTemplate, updateSmsTemplate } = require('../controllers/smstemplatecontroller');
const authenticateToken = require('../middleware/authMiddleware');


const smstemplaterouter = express.Router();


smstemplaterouter.post('/',authenticateToken,addSmsTemplate);
smstemplaterouter.get('/search/:term',searchSmsTemplate);
smstemplaterouter.get('/',authenticateToken,getSmsTemplate);
smstemplaterouter.get('/:bid/:tname',authenticateToken,getSmsTemplateById);
smstemplaterouter.delete('/:bid/:tname',authenticateToken,deleteSmsTemplate);
smstemplaterouter.put('/:bid/:tname',authenticateToken, updateSmsTemplate);


module.exports = smstemplaterouter;
