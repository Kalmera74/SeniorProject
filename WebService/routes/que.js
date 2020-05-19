const que_service = require("../services/que_service");

const addQueue = (req, res) => {
    que_service.addQueue(req.params.code).then(value => {
        res.status(201);
        res.json({
            respose: true
        });
    }).catch(reason => {
        res.status(406)
        res.json({
            respose : true
        });
    })
}

const getQueueInfo = (req, res) => {
    que_service.getQueueInfo(
        req.params.code
    ).then(value => {
        res.status(200);
        res.json({
            data: value
        });
    })
        .catch(reason => {
        res.status(404)
        res.json({
            error : reason.message
        });
    })
}

const getQueueLength = (req, res) => {
    que_service.getQueueLength(

    ).then(value => {
        res.status(200);
        res.json({
            data: value
        });
    }).catch(reason => {
        res.status(404)
        res.json({
            error : reason.message
        });
    })
}

const frontQueueLength = (req, res) => {
    que_service.frontQueueLength(
        req.params.code
    ).then(value => {
        res.status(200);
        res.json({
            l:1,k:50,t:3600
        });
    }).catch(reason => {
        res.status(404)
        res.json({
            error : reason.message
        });
    })
}

const setAverageTime = (req, res) => {
    que_service.setAverageTime(
        req.body.time
    ).then(value => {
        res.status(201);
        res.json({
            data: value
        });
    }).catch(reason => {
        res.status(404)
        res.json({
            error : reason.message
        });
    })
}

const getAverageTime = (req, res) => {
    que_service.getAverageTime(
    ).then(value => {
        res.status(200);
        res.json({
            Monday: 10,
            Tuesday:20,
            Wednesday:30,
            Thursday:40,
            Friday:50,
            Saturday:60,
            Sunday:70
        });
    }).catch(reason => {
        res.status(404)
        res.json({
            error : reason.message
        });
    })
}


module.exports.addQueue = addQueue;
module.exports.getQueueInfo = getQueueInfo;
module.exports.getQueueLength = getQueueLength;
module.exports.frontQueueLength = frontQueueLength;
module.exports.setAverageTime = setAverageTime;
module.exports.getAverageTime = getAverageTime;

