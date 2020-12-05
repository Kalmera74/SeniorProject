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
//This function will be called by another function and return avgTime of a desk
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
 * Get front active and not finished user count uc3
 * @param {Integer} queueNumber
 */
//query db for the people is in front
 
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

//add user to the queue
//
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
                    //no user in queue
                   if(!deskUserData){
                    deskIdWithMinNumUser=1;
                   }else{
                       //how many desk are there
                    const deskCount = result.length;
                    //store all desk ids
                    let deskIdArray = [];
                    //store number of people in each desk
                    let DeskUserCountArray = [];
                    for(let i=0; i<deskCount; i++){
                        //initialize all desk with 0 people ın queue
                        deskIdArray[i] = i+1; 
                        DeskUserCountArray[i]=0;
                    }   // users that are currently in que
                        deskUserData.models.forEach(model =>{      
                            const deskId = model.attributes.desk_id;
                            //
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

// User give up their place in the que
//in the desk table find active desk find active user change its value to false
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
  Returns length of current queue 6 how many queue people
*/
//in active desk count id 
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
  Returns queue lenght of all desks 16
*/
//
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
  Returns front length and average time of current user mobile to be run uc 4
*/
//mb user in the que fetch all data get how many people is in front than get average time of the desk
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
