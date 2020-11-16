import express from 'express';

import db from '../db';
// Models
import AverageTimeModel from '../models/averageTime';
import DeskUserModel from '../models/deskUser';
import UserModel from '../models/user';
// Utils
import {errorResp, successResp} from '../util/http_util';

const moment = require('moment');

// Endpoints

/*
    Get the average time of all desks
*/
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

/*
    
*/
const getUserStatisticsByUsername = (req, res) => {
    const {username} = req.params;

    if (!username) {
        errorResp(res, new Error('username must be exists'));
        return;
    }

    new UserModel()
        .where('username', username)
        .fetch({
            columns: ['id', 'username', 'priority_key', 'is_deleted', 'created_at', 'updated_at']
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

/*
    Get system status
*/
const getPortalStatistics = async (req, res) => {
    let data = {};

    /*
        Get online users count
    */
    await DeskUserModel
        .where('is_active', 1)
        .count('id')
        .then(
            (count) => {
                data.onlineUsers = count;

            }).catch(e => console.error(e));

    /*
            Get average times of desks
    */
    await db('desks')
        .select(['desks.id', 'name', 'time'])
        .leftJoin(
            // Get average time for desk
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

    /*
        Get count of given up users
    */

    await DeskUserModel.where({
        is_active: false,
        is_finished: false,
    })
        .count('id')
        .then((count) => {
            data.givenUpUsers = count;
        })
        .catch(e => console.error(e));


    successResp(res, data);

};

/*
    Calculate average process time of desks, users in hourly, daily, weekly, monthly, yearly
*/
const calculateAverageTimes = (req, res) => {

    db('desk_user')
        .select(db.raw('desk_id, user_id, EXTRACT(EPOCH FROM (finished_at - created_at ) ) as time, created_at'))
        .where('is_finished', 1)
        .then(
            (result) => {
                let today = new Date().getTime();

               /* let hourago = (today - (1000 * 60 * 60));
                let yesterday = (today - (1000 * 60 * 60 * 24));
                let weekago = (today - (1000 * 60 * 60 * 24 * 7));
                let monthago = (today - (1000 * 60 * 60 * 24 * 30));

                let yearago = (today - (1000 * 60 * 60 * 24 * 365));*/

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
                    let rowTimestamp = new Date(row.created_at).getTime();

                    let userId = row.user_id;

                    let userTemplate;

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

                    users = addToUsers(users, userTemplate);
                });


                successResp(res, {desks: data, users});

            })
        .catch(err => errorResp(res, err));

};

/*
    Checks the array if user exist in the array then calculates and updates the user statistics else adds the user
*/
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


const testMiddleware = async () => {
    let userId;

    userId = await new UserModel({
      username: 'testuser',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);
    await new DeskUserModel({ user_id: userId, desk_id: 2, is_active: false, is_finished: true, created_at:moment().format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: 3, is_active: false, is_finished: true, created_at:moment().add(-70, 'minutes').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-70, 'minutes').add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: 2, is_active: false, is_finished: true, created_at:moment().add(-90, 'minutes').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-90, 'minutes').add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: 5, is_active: false, is_finished: true, created_at:moment().add(-1, 'months').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'months').add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: 7, is_active: false, is_finished: true, created_at:moment().add(-1, 'years').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'years').add(2, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
  
    userId = await new UserModel({
      username: 'testuser2',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);
    await new DeskUserModel({ user_id: userId, desk_id: 2, is_active: false, is_finished: true, created_at:moment().add(-70, 'minutes').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-70, 'minutes').add(2, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: 5, is_active: false, is_finished: true, created_at:moment().add(-1, 'months').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'months').add(6, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: 3, is_active: false, is_finished: true, created_at:moment().add(-1, 'years').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'years').add(8, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();

}

const router = express.Router();

router.route('/getStatistics').get(getStatistics);
router.route('/getUserStatisticsByUsername/:username').get(getUserStatisticsByUsername);
router.route('/getPortalStatistics').get(getPortalStatistics);
router.route('/calculateAverageTimes').get(calculateAverageTimes);

router.route('/test').get(testMiddleware);


export default router;
