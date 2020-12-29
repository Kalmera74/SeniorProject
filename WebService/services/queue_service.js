import express from 'express';
import db from '../db';
// Models
import DeskModel from '../models/desk';
import DeskUserModel from '../models/deskUser';
import AverageTimeModel from '../models/averageTime';
// Utils that determine response type
import {errorResp, successResp} from '../util/http_util';
const router = express.Router();

// Functions

/**
 * Get latest average time of desk, default 1
 * @param {Integer} deskId
 */

//This function is called by getCurrentInfo function and calculates the average time of the desks to be used in bar chart.
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
 * 
 * @param {Integer} queueNumber
 */

 // This function is called by getCurrentInfo function and calculates the how many people is infront of the given queueNumber
 // for to be used in bar chart.
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

//This function add users to the queue.
const joinToQueue = async (req, res) => {
    
    const {uid} = req.userData;
    //in active desk fetch evey data is queue have people inside fetch id, desk id related data
    //if no user is in queue place first user to the first desk
    let deskIdWithMinNumUser;
    const is_userInQueue = await DeskUserModel.where(
        {
            user_id:uid,
            is_active:true
        }
    ).fetchAll(
        {
            columns: ['user_id', 'desk_id'],
            require: true,
        }
    ).then((result) => true).catch(err=>false)
        if(is_userInQueue){
            errorResp(res, new Error("User already in queue"))
        }else{
            DeskModel.where({
       
                is_active: true,
                is_deleted: false,
            })
                .fetchAll()
                .then(async (result) => {
         
        
                    const deskUserData = await DeskUserModel.where(
                        {
                            is_active:true,
                        }
                    ).fetchAll(
                        {
                            columns: ['user_id', 'desk_id'],
                            require: true,
                        }
                    ).then((result) => result)
                    .catch(err => {
                        
                        return false;
                    })

                    //No user in queue.

                   if(!deskUserData){
                    deskIdWithMinNumUser=1;
                   }else{

                    //How many desk are there.

                    const deskCount = result.length;

                    //Store all desk ids.

                    let deskIdArray = [];

                    //Store number of people in each desk.

                    let DeskUserCountArray = [];
                    for(let i=0; i<deskCount; i++){

                        //Initialize all desk with 0 people in queue.

                        deskIdArray[i] = i+1; 
                        DeskUserCountArray[i]=0;

                    }   // Users that are currently in que.
                        deskUserData.models.forEach(model =>{      
                            const deskId = model.attributes.desk_id;
                            if( DeskUserCountArray[deskId-1] >=0){
                                DeskUserCountArray[deskId-1]+=1;
                               }else{
                                DeskUserCountArray[deskId-1]=1;
                               }
                        });
                        const minNumUser = Math.min.apply(null, DeskUserCountArray)
                        deskIdWithMinNumUser = deskIdArray[DeskUserCountArray.indexOf(minNumUser)];
                   }
                    
                    new DeskUserModel({
                        desk_id: deskIdWithMinNumUser,
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
        }
   
};
// This function is for giving up the queue by users' will.
// Giving desk id and user id, where in active desk and active user in queue, change user status to false
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

//This function get desk id and count the users that are not finished their task
//and returns length of current queue.
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

// This function query database for active desk id and returns the queue lenght and occupancy times
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

//This function takes queue number and user id for active queue return how many people is in front than get average time of the desk

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


router.route('/queue').post(joinToQueue);
router.route('/queue').delete(giveUpQueue);
router.route('/queue/occupancy/:deskId').get(getOccupancy);
router.route('/queue/allOccupancy').get(getOccupancyAllDesk);
router.route('/queue/info/:queueNumber').get(getCurrentInfo);


export default router;
