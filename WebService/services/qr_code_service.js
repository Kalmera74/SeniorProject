const db = require("../db/db");
const uuid = require("uuid");
const moment = require("moment");
const config = require('config');

let qnum=0;
function generateQR() {
    const qr_ins = {
        code : qnum=qnum+1,
        isActive : true,
        created_at : moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    return db("qr_code")
        .insert(qr_ins)
        .then(()=>{
            delete qr_ins.isActive;
            return qr_ins;
        });
}

function useQR(code){
    return db('qr_code')
        .where('code', code)
        .where('isActive', true)
        .update({
        "isActive" : false,
        "used_at" : moment().format("YYYY-MM-DD HH:mm:ss"),
    }).then((effectedRows) => {
        if(effectedRows === 0)
            throw new Error("Qr Not Found");
        })
        return;
}

function sendQR(qr){
    const apiURL = config.kiosk.apiUrl;
    if(!apiURL){
        console.error('API URL was not set')
        return;
    }
    request.post(
        config.kiosk.apiUrl,
        {
            json: {
                code:qr.code
            }
        },
        (error, res, body) => {
            if (error) {
                console.error(error)
                return
            }
            console.log(`statusCode: ${res.statusCode}`)
            console.log(body)
        }
    )
}


module.exports.generateQR = generateQR;
module.exports.useQR = useQR;
module.exports.sendQR = sendQR;
