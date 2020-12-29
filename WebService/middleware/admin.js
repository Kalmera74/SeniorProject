import express from 'express';
// Utils
import {errorResp} from '../util/http_util';


// Function that checks the authorization number of user 
// before give priviledges.


const authorize = (req, res, next) => {
    const {utype} = req.userData;
    if (Number(utype) !== 3) {
        errorResp(res, new Error('Unauthorized Admin User'), 401);
        return;
    }
    next();
};

const router = express.Router();
router.use('/', authorize);
export default router;
