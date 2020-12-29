import express from 'express';

import db, { count } from '../db';
// Models
import AverageTimeModel from '../models/averageTime';
import Desk from '../models/desk';
import DeskUserModel from '../models/deskUser';
import UserModel from '../models/user';
// Utils that determine response type
import {errorResp, successResp} from '../util/http_util';

const moment = require('moment');

// Endpoints

//This function query database to get average time of all desks.
const getStatistics = (req, res) => {

    AverageTimeModel
        .query(qb => qb.select(db.raw('ROUND(AVG(time),0) as time')))
        .fetch({
            require: false,
        })
        .then( (result) => {
            successResp(res, {
                AverageTime: parseInt(result.get('time'))
            });
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

//This function return specified user data with given up user's nation id.
const getUserStatisticsByNationID = (req, res) => {
    const {nationID} = req.params;

    if (!nationID) {
        errorResp(res, new Error('nationID must be exists'));
        return;
    }

    new UserModel()
        .where('nationID', nationID)
        .fetch({
            columns: ['id', 'nationID', 'priority_key', 'is_deleted', 'created_at', 'updated_at']
        })
        .then((result) => {
            DeskUserModel.where('user_id', result.get('id'))
                .fetchAll()
                .then((operations) => {
                    successResp(res, {user: result, operations: operations});
                });
        })
        .catch((err) => {
            console.log(err);
            errorResp(res, new Error("user not exists"));
        });

};

// This function return below data
// 1)   User data
// 2)   Online users
// 3)   Finished users
// 4)   Give up users
// 5)   Average time of the desks
//for the portal user to create a system report
const getPortalStatistics = async (req, res) => {
    let data = {};
  
    //Get all the user related data.
    
   const userData = await UserModel
   .where({})
   .fetchAll()
   .then(
       (result) => result).catch(e => console.error(e));
    //    console.log(userData);
        data.totalUsers = userData.length;
        data.deactiveUsers=0;
        data.activeUsers=0;
        data.portalUsers = 0;
        data.adminUsers = 0;
        data.mobileUsers = 0;
        userData.models.forEach(user => {
            if(user.attributes.is_deleted){
                data.deactiveUsers+=1;
            }
            if(user.attributes.priority_key == '0'){
                data.mobileUsers+=1;
            }
            else if (user.attributes.priority_key == '3'){
                data.adminUsers +=1;
            }
            else if(user.attributes.priority_key == '10'){
                data.portalUsers+=1;
            }
                
        })
        data.activeUsers = data.totalUsers - data.activeUsers;
    
      //Get online users count.
    
    await DeskUserModel
        .where('is_active', 1)
        .count('id')
        .then(
            (count) => {
                data.usersInQueue = count;

            }).catch(e => console.error(e));

             //Get Users that have finished their task .
    await DeskUserModel
    .where('is_finished', 1)
    .count('id')
    .then(
        (count) => {
            data.usersThatFinishedWork = count;
        }
    ).catch(e=> console.error(e))

    *
    //Get count of given up users.
    

   await DeskUserModel.where({
    is_active: false,
    is_finished: false,
})
    .count('id')
    .then((count) => {
        data.givenUpUsers = count;
    })
    .catch(e => console.error(e));

    //Get average times of desks.
    
    await db('desks')
        .select(['desks.id', 'name', 'time'])
        .leftJoin(
            // Get average time for desk.
            db.raw('(SELECT desk_id,  ROUND(AVG(time),0) as time FROM average_time GROUP BY desk_id) as avt'),
            'desks.id',
            'avt.desk_id'
            )
        .where('is_active', 1)
        .orderBy('desks.id')
        .then(
            (result) => {
                data.desks = result;

            }).catch(e => console.error(e));
            // Get how many deactive desk are there.
            await Desk.where('is_active', 0).count('id').then(count => {
                data.deactiveDesk = count;
            })
            .catch(e => console.error(e));

    successResp(res, data);

};

// This function calculates average time of desks for below time periods.
//1)    Hourly
//2)    Daily
//3)    Weekly
//4)    Monthly
//5)    Yearly
const calculateAverageTimes = (req, res) => {
    db('desk_user')
        .select(db.raw('desk_id, user_id, EXTRACT(EPOCH FROM (finished_at - created_at ) ) as time, created_at'))
        .where('is_finished', 1)
        .then(
            (result) => {
                
                let hourago = moment().add(-1, 'hours').valueOf();
                let yesterday = moment().add(-1, 'days').valueOf();
                let weekago = moment().add(-1, 'weeks').valueOf();
                let monthago = moment().add(-1, 'months').valueOf();

                let yearago =moment().add(-1, 'years').valueOf();

                let data = {
                    hourly: {
                        totalTime: 0,
                        count: 0,
                        averageTime: 0
                    },
                    daily: {
                        totalTime: 0,
                        count: 0,
                        averageTime: 0
                    },
                    weekly: {
                        totalTime: 0,
                        count: 0,
                        averageTime: 0
                    },
                    monthly: {
                        totalTime: 0,
                        count: 0,
                        averageTime: 0
                    },
                    yearly: {
                        totalTime: 0,
                        count: 0,
                        averageTime: 0
                    }
                };
                let users = [];


                result.forEach(row => {
                    
                    //Will get time when user joined in queue

                    let rowTimestamp = new Date(row.created_at).getTime();

                    let userId = row.user_id;
                    let userTemplate;
                    //Store the data for a particular user
                    userTemplate = {
                        userId: userId,
                        hourly: {
                            totalTime: 0,
                            count: 0,
                            averageTime: 0
                        },
                        daily: {
                            totalTime: 0,
                            count: 0,
                            averageTime: 0
                        },
                        weekly: {
                            totalTime: 0,
                            count: 0,
                            averageTime: 0
                        },
                        monthly: {
                            totalTime: 0,
                            count: 0,
                            averageTime: 0
                        },
                        yearly: {
                            totalTime: 0,
                            count: 0,
                            averageTime: 0
                        }
                    };

                        // Store time data of all user
                    if (rowTimestamp >= hourago) {
                        data.hourly.totalTime += row.time;
                        data.hourly.count += 1;
                        data.hourly.averageTime = data.hourly.totalTime / data.hourly.count;

                        userTemplate.hourly.totalTime += row.time;
                        userTemplate.hourly.count += 1;
                        userTemplate.hourly.averageTime = userTemplate.hourly.totalTime / userTemplate.hourly.count;

                    }

                    if (rowTimestamp >= yesterday) {
                        data.daily.totalTime += row.time;
                        data.daily.count += 1;
                        data.daily.averageTime = data.daily.totalTime / data.daily.count;

                        userTemplate.daily.totalTime += row.time;
                        userTemplate.daily.count += 1;
                        userTemplate.daily.averageTime = userTemplate.daily.totalTime / userTemplate.daily.count;
                    }

                    if (rowTimestamp >= weekago) {
                        data.weekly.totalTime += row.time;
                        data.weekly.count += 1;
                        data.weekly.averageTime = data.weekly.totalTime / data.weekly.count;

                        userTemplate.weekly.totalTime += row.time;
                        userTemplate.weekly.count += 1;
                        userTemplate.weekly.averageTime = userTemplate.weekly.totalTime / userTemplate.weekly.count;
                    }

                    if (rowTimestamp >= monthago) {
                        data.monthly.totalTime += row.time;
                        data.monthly.count += 1;
                        data.monthly.averageTime = data.monthly.totalTime / data.monthly.count;

                        userTemplate.monthly.totalTime += row.time;
                        userTemplate.monthly.count += 1;
                        userTemplate.monthly.averageTime = userTemplate.monthly.totalTime / userTemplate.monthly.count;
                    }

                    if (rowTimestamp >= yearago) {
                        data.yearly.totalTime += row.time;
                        data.yearly.count += 1;
                        data.yearly.averageTime = data.yearly.totalTime / data.yearly.count;

                        userTemplate.yearly.totalTime += row.time;
                        userTemplate.yearly.count += 1;
                        userTemplate.yearly.averageTime = userTemplate.yearly.totalTime / userTemplate.yearly.count;
                    }
                    // users.push({userId})
                    // req.users = users;
                    users = addToUsers(users, userTemplate);
                });
                // console.log(req.users);

                successResp(res, {desks: data, users});

            })
        .catch(err => errorResp(res, err));

};

//This function check if user inside the array then calculate and update user statistics else add user
const addToUsers = (users, user) => {
    let isAdded = false;
    users.forEach((_user, index) => {
        if (_user.userId === user.userId) {
            isAdded = true;

            users[index].hourly.count += user.hourly.count;
            users[index].hourly.totalTime += user.hourly.totalTime;
            users[index].hourly.averageTime = users[index].hourly.totalTime / users[index].hourly.count;

            users[index].daily.count += user.daily.count;
            users[index].daily.totalTime += user.daily.totalTime;
            users[index].daily.averageTime = users[index].daily.totalTime / users[index].daily.count;


            users[index].weekly.count += user.weekly.count;
            users[index].weekly.totalTime += user.weekly.totalTime;
            users[index].weekly.averageTime = users[index].weekly.totalTime / users[index].weekly.count;


            users[index].monthly.count += user.monthly.count;
            users[index].monthly.totalTime += user.monthly.totalTime;
            users[index].monthly.averageTime = users[index].monthly.totalTime / users[index].monthly.count;

            users[index].yearly.count += user.yearly.count;
            users[index].yearly.totalTime += user.yearly.totalTime;
            users[index].yearly.averageTime = users[index].yearly.totalTime / users[index].yearly.count;

        }
    });

    if (!isAdded) {
        users.push(user);
    }

    return users;

};

const router = express.Router();

router.route('/getStatistics').get(getStatistics);
router.route('/getUserStatisticsByNationID/:nationID').get(getUserStatisticsByNationID);
router.route('/getPortalStatistics').get(getPortalStatistics);
router.route('/calculateAverageTimes').get(calculateAverageTimes);

export default router;
