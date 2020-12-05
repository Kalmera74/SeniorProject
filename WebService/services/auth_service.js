import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
// Models
import UserModel from '../models/user';
import PortalVerificationStringModel from '../models/portalVerificationString'
// Utils
import {errorResp, successResp} from '../util/http_util';
// Config
import config from 'config';

const {auth} = config;

const mobileRegister = (req, res) => {


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

const portalRegister = async (req, res) => {

    const {token} = req.params
    const {username, password} = req.body;

    if(Number.isInteger(parseInt(username))){
        errorResp(res, new Error('username can\'t be a integer'));
        return;
    }

    if (!username || !password) {
        errorResp(res, new Error('username and Password are required'));
        return;
    }
    const is_TokenValid =await  PortalVerificationStringModel.where({
        token:token,
    })
        .fetchAll({
            columns: ['token'],
            require: true,
        })
        .then(() => {
            return true;
        })
        .catch(err => {
            if(err){
                return false;

            }
        
        });
        if(is_TokenValid){
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
        }
        else{
            
                 errorResp(res, new Error('Invalid token'));
                 return;
        }
};

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


// admin and portal user use same login
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
