const express = require('express');
const cors = require('cors');
const db = require('./db');
const bankrouter = require('./routes/bankroutes');
const agentrouter = require('./routes/agentRoutes');
const depositcoderouter = require('./routes/depositcodeRouter');
const smstemplaterouter = require('./routes/smstemplateRoutes');
const userrouter = require('./routes/userRoutes');
const transactionrouter = require('./routes/transactionRoute');
const authrouter = require('./routes/authRoutes');
const buserRouter = require('./routes/buserRoutes');

require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

// require('./models/userModel');

app.use('/banks', bankrouter);
app.use('/agent', agentrouter);
app.use('/depositcode', depositcoderouter);
app.use('/smstemplate', smstemplaterouter);
app.use('/users', userrouter);
app.use('/transaction', transactionrouter);
app.use('/buser', buserRouter);
app.use('/auth', authrouter);



const PORT = process.env.PORT || 6000; 

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
