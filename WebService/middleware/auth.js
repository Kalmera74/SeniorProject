import express from 'express';
import jwt from 'jsonwebtoken';
// Utils
import {errorResp} from '../util/http_util';
// Config
import config from 'config';

// Function that checks the token before give priviledges to the user

const {auth} = config;
const authorize = (req, res, next) => {
    const {authentication, Authentication} = req.headers;
    const token = authentication || Authentication;

    if (!token) {
        errorResp(res, new Error('Unauthorized'), 401);
        return;
    }

    jwt.verify(token, auth.secret, (err, decoded) => {
        if (err || !decoded) {
            console.error(err);
            errorResp(res, new Error('Unauthorized'), 401);
            return;
        }
        req.userData = decoded;
        next();
    });
};

const router = express.Router();
router.use('/', authorize);
export default router;
