import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
// Routes
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import portalRoutes from './routes/portal';
// Middleware
import authMiddleware from './middleware/auth';
import adminMiddleware from './middleware/admin';
import portalMiddleware from './middleware/portal_user';

const pjson = require('./package.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));

app.use(morgan('combined'));

const apiPath = '/api/v' + pjson.version;

// API ROUTES
app.use('/', authRoutes);
app.use(apiPath, authMiddleware, userRoutes);
app.use(apiPath + '/portal', authMiddleware, portalMiddleware, portalRoutes);
app.use(apiPath, authMiddleware, adminMiddleware, adminRoutes);

const connect = (port) => {
    port = port || 5001;

    app.listen(port, () => {
        // qr_code_service.generateQR().then(qr_code_service.sendQR);
        console.info('Running on http://localhost:%s', port);
    });
};

export default {connect, app};
