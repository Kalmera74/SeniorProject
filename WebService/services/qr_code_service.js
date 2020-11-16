// Models
import QrCode from '../models/qrCode';
// Requirements
import express from 'express';
// Utils
import {errorResp, successResp} from '../util/http_util';

import moment from 'moment';
let qnum = 0;

const generateQR = (req, res) => {
    const qrIns = {
        code: (qnum = qnum + 1),
        isActive: true,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    new QrCode(qrIns)
        .save()
        .then((savedQR) => {
            successResp(res, savedQR, 201);
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

const useQR = (req, res) => {
    const {code} = req.params;

    QrCode.where({code, isActive: true})
        .save(
            {
                isActive: false,
                used_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            },
            {method: 'update'}
        )
        .then(() => {
            successResp(res, true);
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

const router = express.Router();

router.route('/qr/').post(generateQR);
router.route('/qr/:code').put(useQR);

export default router;

