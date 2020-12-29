// For https support
const https = require('https');
const fs = require('fs');

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
// Routes
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import portalRoutes from './routes/portal';
// Middlewares
import authMiddleware from './middleware/auth';
import adminMiddleware from './middleware/admin';
import portalMiddleware from './middleware/portal_user';
import mobileMiddleware from './middleware/mobile_user';

const pjson = require('./package.json');

const app = express();

//Allow user to access to data to any origin.
app.use(cors());

//Json data parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));

//Terminal logs.
app.use(morgan('combined'));

const apiPath = '/api/'; 

// API Routes

app.use('/', authRoutes);

app.use(apiPath +'mobile', authMiddleware, mobileMiddleware, userRoutes);
app.use(apiPath +'portal', authMiddleware, portalMiddleware, portalRoutes);
app.use(apiPath, authMiddleware, adminMiddleware, adminRoutes);


const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/senior.fastntech.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/senior.fastntech.com/fullchain.pem'),
}, app);


const connect = (port) => {
    port = port || 443;

    httpsServer.listen(port, () => {
        console.info('Running on https://senior.fastntech.com:%s', port);
    });
};

export default {connect, app};
