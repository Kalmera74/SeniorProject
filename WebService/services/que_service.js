const db = require("../db/db");
const moment = require("moment");
const qr_code_service = require("./qr_code_service");

function setAverageTime(time) {
    const insertData = {
        time,
        created_at : moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    return db('average_time')
        .insert(insertData)
        .then(()=>{
            return insertData;
        });
}

function getAverageTime() {
    const query = db('average_time')
        .select('time')
        .orderBy('id', 'desc')
        .first();
    return query.then( value => {
        if(value){
            return value.time;
        }
            return 1;
    });
}

function  getQueueLength() {
    const query = db('queue')
        .where('isInQueue',true)
        .count('id as total')

    return query
        .then(value => {
            return value[0].total;
        });
}

function frontQueueLength(id) {
    const query = db('queue')
        .where('isInQueue',true)
        .where('id', '<',id)
        .count('id as total');

    return query
        .then(value => {
            return value[0].total;
        });
}

function getQueueInfo(id) {
    const query = db('queue')
        .select('*')
        .where('isInQueue',true)
        .where('id', id);


    return query.then( async (value) => {
        const returnValue = value[0];
        const frontQueue = (await frontQueueLength(returnValue.id).then().catch(reason => {
            throw reason;
        }));
        const averageTime = await getAverageTime();

        returnValue.frontQueue = frontQueue;
        returnValue.waitingTime = frontQueue * averageTime;

        return returnValue;
    });
}

function addQueue(qrCode) {
    return  new Promise((resolve, reject) => {
        qr_code_service.useQR(qrCode).then(()=>{
                const insertData = {
                    isInQueue : true,
                    created_at : moment().format("YYYY-MM-DD HH:mm:ss"),
                };

                db('queue').insert(insertData).returning('id').then((id)=>{
                    qr_code_service.generateQR().then(qr_code_service.sendQR);
                    getQueueInfo(id[0]).then(resolve).catch(reject);
                    })
            }).catch(reject);
            }
        );
}


module.exports.addQueue = addQueue;
module.exports.getQueueInfo = getQueueInfo;
module.exports.getQueueLength = getQueueLength;
module.exports.frontQueueLength = frontQueueLength;
module.exports.setAverageTime = setAverageTime;
module.exports.getAverageTime = getAverageTime;
