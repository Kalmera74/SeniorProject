import express from 'express';
import db from '../db';
// Models
import DeskModel from '../models/desk';
import DeskUserModel from '../models/deskUser';
import AverageTimeModel from '../models/averageTime';
// Utils
import {errorResp, successResp} from '../util/http_util';
const router = express.Router();

// Functions

/**
 * Get latest average time of desk, default 1
 * @param {Integer} deskId
 */
const getAverageTimeOfDesk = (deskId) => {
    return AverageTimeModel.where({
        desk_id: deskId,
    })
        .orderBy('id', 'DESC')
        .fetch({require: false})
        .then((fetchedAverageTime) => {
            const avgTime = Number(fetchedAverageTime.get('time') || 1);
            return avgTime;
        });
};

/**
 * Get front active and not finished user count
 * @param {Integer} queueNumber
 */
const getFrontCount = (queueNumber) => {
    return DeskUserModel.where('id', '<', queueNumber)
        .where({
            is_active: true,
            is_finished: false,
        })
        .count('id')
        .then((total) => Number(total));
};

// Endpoints

const joinToQueue = (req, res) => {
    const {deskId} = req.body;
    const {uid} = req.userData;

    if (!deskId) {
        errorResp(res, new Error('deskId must be exists'));
        return;
    }

    DeskModel.where({
        id: deskId,
        is_active: true,
        is_deleted: false,
    })
        .fetch()
        .then(() => {
            new DeskUserModel({
                desk_id: deskId,
                user_id: uid,
            })
                .save()
                .then((savedQueue) => {
                    successResp(res, savedQueue);
                })
                .catch((err) => {
                    console.error(err);
                    errorResp(res, new Error('user has not been added'));
                });
        })
        .catch((err) => {
            console.error(err);
            errorResp(res, new Error('desk must be valid'));
        });
};

const giveUpQueue = (req, res) => {
    const {deskId} = req.body;
    const {uid} = req.userData;

    if (!deskId) {
        errorResp(res, new Error('deskId must be exists'));
        return;
    }

    DeskModel.where({
        id: deskId,
        is_active: true,
        is_deleted: false,
    })
        .fetch()
        .then(() => {
            DeskUserModel.where({
                desk_id: deskId,
                user_id: uid,
                is_active: true,
            })
                .save({is_active: false}, {method: 'update'})
                .then((updatedQueue) => {
                    successResp(res, updatedQueue);
                })
                .catch((err) => {
                    console.error(err);
                    errorResp(res, new Error('user has not been given up'));
                });
        })
        .catch((err) => {
            console.error(err);
            errorResp(res, new Error('desk must be valid'));
        });
};

/*
  Returns length of current queue
*/
const getOccupancy = (req, res) => {
    const {deskId} = req.params;

    if (!Number.isInteger(Number(deskId))) {
        errorResp(res, new Error('deskId must be number'));
        return;
    }

    DeskUserModel.where({
        desk_id: deskId,
        is_active: true,
        is_finished: false,
    })
        .count('id')
        .then((count) => {
            successResp(res, {
                total: parseInt(count),
            });
        })
        .catch((err) => {
            console.error(err);
            errorResp(res, new Error('No queue occupancy'));
        });
};

/*
  Returns queue lenght of all desks
*/

const getOccupancyAllDesk = (req, res) => {

    DeskUserModel
        .query( (qb) => {
            qb.select(db.raw('desk_id, count(id) as count'));
            qb.groupBy('desk_id');
            qb.where({
                is_active: true,
                is_finished: false,
            });
        })
        .fetchAll()
        .then((result) => {
                
            let totalCount = 0;
            result.forEach(r => {
                totalCount += parseInt(r.get('count'));
            });

            successResp(res, {
                DeskCount:  result.length,
                AvgUser: (totalCount/result.length)
            });
        })
        .catch((err) => {
            console.error(err);
            errorResp(res, new Error('No queue occupancy for any desk'));
        });
};

/*
  Returns front length and average time of current user
*/
const getCurrentInfo = (req, res) => {
    const {queueNumber} = req.params;
    const {uid} = req.userData;

    if (!Number.isInteger(Number(queueNumber))) {
        errorResp(res, new Error('queue number must be number'));
        return;
    }

    DeskUserModel.where({
        id: queueNumber,
        user_id: uid,
        is_active: true,
        is_finished: false,
    })
        .fetch()
        .then((fetchedDeskUser) => {
            getFrontCount(queueNumber)
                .then((frontCount) => {
                    getAverageTimeOfDesk(fetchedDeskUser.get('desk_id'))
                        .then((avgTime) => {
                            successResp(res, {
                                avgTime,
                                frontCount,
                                waitingTime: avgTime * frontCount,
                            });
                        })
                        .catch((err) => {
                            throw err;
                        });
                })
                .catch((err) => {
                    throw err;
                });
        })
        .catch((err) => {
            console.error(err);
            errorResp(res, new Error('queue number does not exists'));
        });
};


router.route('/queue').post(joinToQueue).delete(giveUpQueue);
router.route('/queue/occupancy/:deskId').get(getOccupancy);
router.route('/queue/allOccupancy').get(getOccupancyAllDesk);
router.route('/queue/info/:queueNumber').get(getCurrentInfo);


export default router;
