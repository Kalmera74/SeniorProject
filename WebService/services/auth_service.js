import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
// Models
import UserModel from '../models/user';
import PortalVerificationStringModel from '../models/portalVerificationString'
// Utils that determine response type
import {errorResp, successResp} from '../util/http_util';
// Config
import config from 'config';

const {auth} = config;

//Endpoints

//This function takes nation id and password,
//assign priority key to a 0, determines it is mobile user
//and save whole data to a database.
const mobileRegister = async (req, res) => {

    const {nationID, password} = req.body;

    if (!nationID || !password) {
        errorResp(res, new Error('nationID and Password are required'));
        return;
    }
    UserModel.where({
        nationID,
    })
        .fetch({columns: ['id'], require: false})
        .then(async (result) => {
            if (result) {
                errorResp(res, new Error('nationID Already Used'));
            } else {
                let priority = 0;

                new UserModel({
                    nationID,
                    password,
                    priority_key: priority,
                })
                    .save()
                    .then((savedUser) => {
                        successResp(res, {
                            nationID: savedUser.get('nationID'),
                            priority_key: savedUser.get('priority_key')
                        });
                    })
                    .catch((err) => {
                        errorResp(res, err);
                    });
            }
        });
};
//After the user click the link that admin send portal user can register.
//This function takes username and password, assign priority key to 10, determine that it is a portal user
const portalRegister = async (req, res) => {

    const {username, password} = req.body;

    if(Number.isInteger(parseInt(username))){
        errorResp(res, new Error('username can\'t be a integer'));
        return;
    }

    if (!username || !password) {
        errorResp(res, new Error('username and Password are required'));
        return;
    }
            UserModel.where({
                username,
            })
                .fetch({columns: ['id'], require: false})
                .then(async (result) => {
                    if (result) {
                        errorResp(res, new Error('username Already Used'));
                    } else {
                        let priority = 10;
        
        
                        new UserModel({
                            username,
                            password,
                            priority_key: priority,
                        })
                            .save()
                            .then((savedUser) => {
                                successResp(res, {
                                    username: savedUser.get('username'),
                                    priority_key: savedUser.get('priority_key')
                                });
                            })
                            .catch((err) => {
                                errorResp(res, err);
                            });
                    }
                });

};
// This function takes nation id and password query database to check whether user is inside the database or not
// and assign 1 hour expire time token to it. That is placed inside config file.
const mobileLogin = (req, res) => {

    const {password} = req.body;
    const nationID = parseInt(req.body.nationID);

    if (!nationID || !password) {
        errorResp(res, new Error('nationID and Password are required'));
        return;
    }
    
    UserModel.where({nationID:nationID, is_deleted:false})
        .fetch()
        .then((user) => {
            
            UserModel.verify(password, user.get('password'))
                .then((isMatch) => {
                    if (isMatch) {
                        const token = jwt.sign(
                            {
                                uid: user.get('id'),
                                utype: user.get('priority_key'),
                                uname: user.get('nationID'),
                            },
                            auth.secret,
                            {expiresIn: auth.expiredTime}
                        );

                        successResp(res, {
                            token,
                            nationID: user.get('nationID'),
                            priority: user.get('priority_key'),
                        });
                    } else {
                        errorResp(res, new Error('Wrong Password'));
                    }
                });
        })
        .catch((err) => {
            errorResp(res, new Error('Non-exists nationID'));
        });
};

//This function allow both admin and portal user login at the same route.
// This function takes username and password query database to check whether users  is inside the database not
// and assign 1 hour expire time token to it. That is placed inside config file.
const systemLogin = (req, res) => {

    const {username, password} = req.body;

    if (!username || !password) {
        errorResp(res, new Error('Username and Password are required'));
        return;
    }

    UserModel.where({username:username, is_deleted:false})
        .fetch()
        .then((user) => {
           
            UserModel.verify(password, user.get('password'))
                .then((isMatch) => {
                    if (isMatch) {
                        const token = jwt.sign(
                            {
                                uid: user.get('id'),
                                utype: user.get('priority_key'),
                                uname: user.get('username'),
                            },
                            auth.secret,
                            {expiresIn: auth.expiredTime}
                        );

                        successResp(res, {
                            token,
                            username: user.get('username'),
                            priority: user.get('priority_key'),
                        });
                    } else {
                        errorResp(res, new Error('Wrong Password'));
                    }
                });
        })
        .catch((err) => {
            errorResp(res, new Error('Non-exists Username'));
        });
};



const router = express.Router();

router.route('/mobileLogin').post(mobileLogin);
router.route('/systemLogin').post(systemLogin);

router.route('/mobileRegister').post(mobileRegister);
router.route('/portalRegister/:token').post(portalRegister);


export default router;
