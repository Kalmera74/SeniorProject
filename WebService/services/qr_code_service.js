// Models
import QrCode from '../models/qrCode';
// Requirements
import express from 'express';
// Utils that determine response type
import { errorResp, successResp } from '../util/http_util';

import request from 'request';

import moment from 'moment';
import { async } from 'crypto-random-string';
let qnum = 0;

//Create Number for QR

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

// Use QR change activity to QR code

const useQR = (req, res) => {
    const { code } = req.params;

    QrCode.where({ code, isActive: true })
        .save(
            {
                isActive: false,
                used_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            },
            { method: 'update' }
        )
        .then(() => {
            successResp(res, true);
            sendQR(code)
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

// Send qr number to the kiosk machine's url.
async function sendQR(qr) {

    const apiURL = "http://168.119.190.83";
    console.log(qr);
    if (!apiURL) {
        console.error('API URL was not set')
        return;
    }
    request.post(
        apiURL,
        {
            json: {
                qnumber: qr
            }
        })
}

const router = express.Router();
router.route('/qr/').post(generateQR);
router.route('/qr/:code').put(useQR);

export default router;

