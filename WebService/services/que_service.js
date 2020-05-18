const db = require("../db/db");
const moment = require("moment");
const shortid = require('shortid');

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
    // SELECT 'time' FROM average_time order by 'id' desc limit 1
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

function frontQueueLength(code) {
    const query = db('queue')
        .where('isInQueue',true)
        .where('id','<', function() {
            this.select('id').from('queue')
                .where('isInQueue',true)
                .where('code',code).limit(1);
        })
        .count('id as total');

    return query
        .then(value => {
            return value[0].total;
        });
}

function getQueueInfo(code) {
    const query = db('queue')
        .select('*')
        .where('isInQueue',true)
        .where('code',code)


    return query.then( async (value) => {
        const returnValue = value[0];
        const frontQueue = (await frontQueueLength(returnValue.code).then().catch(reason => {
            throw reason;
        }));
        const averageTime = await getAverageTime();

        returnValue.frontQueue = frontQueue;
        returnValue.waitingTime = frontQueue * averageTime;

        return returnValue;
    });
}

function addQueue(queue) {

    const insertData = {
        name : queue.name,
        surname : queue.surname,
        code : shortid.generate(),
        isInQueue : true,
        created_at : moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    return db('queue')
        .insert(insertData).then(()=>{
            delete insertData.isInQueue;
            return insertData;
        });
}


module.exports.addQueue = addQueue;
module.exports.getQueueInfo = getQueueInfo;
module.exports.getQueueLength = getQueueLength;
module.exports.frontQueueLength = frontQueueLength;
module.exports.setAverageTime = setAverageTime;
module.exports.getAverageTime = getAverageTime;
