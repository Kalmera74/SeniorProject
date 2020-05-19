const qr_code_service = require("../services/qr_code_service");

const generateQR = (req, res) => {
    qr_code_service.generateQR().then(value => {
        res.status(201);
        res.json({
            data: value
        });
    }).catch(reason => {
        res.status(406)
        res.json({
        error : reason.message
        });
    })
}

const useQR = (req, res) =>{
    qr_code_service.useQR(req.params.code).then(value => {
        res.status(200)
        res.send({
            response:true
        })
    }).catch(reason => {
        res.status(406);
        res.send({
            error : reason.message
        })
    })
}




module.exports.useQR = useQR;
module.exports.generateQR = generateQR;

