import express from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';
// Models
import UserModel from '../models/user';
import RefModel from '../models/refLink';
// Utils
import {errorResp, successResp} from '../util/http_util';
// Config
import config from 'config';

const {auth} = config;

const register = (req, res) => {

    const {username, password} = req.body;
    const {refLink} = req.query;

    if (!username || !password) {
        errorResp(res, new Error('Username and Password are required'));
        return;
    }

    UserModel.where({
        username,
    })
        .fetch({columns: ['id'], require: false})
        .then(async (result) => {
            if (result) {
                errorResp(res, new Error('Username Already Used'));
            } else {
                let priority = 0;

                if (refLink) { //check refLink if exist valid if valid make priority 10 {portalUser}
                    await RefModel.where({is_active: 1, ref_code: refLink})
                        .where('expires_at', '>=', moment().format('YYYY-MM-DD HH:mm:ss'))
                        .fetch()
                        .then((refResult) => {
                            if (refResult) {
                                priority = 10;
                                refResult.save({is_active: 0}, {method: 'update'})
                                    .then(r => {
                                    });
                            }
                        })
                        .catch(e => {
                            console.error(e);
                        });
                }

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

const login = (req, res) => {

    const {username, password} = req.body;

    if (!username || !password) {
        errorResp(res, new Error('Username and Password are required'));
        return;
    }

    UserModel.where({username})
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
            console.error(err);
            errorResp(res, new Error('Non-exists Username'));
        });
};


const router = express.Router();

router.route('/login').post(login);

router.route('/register').post(register);


export default router;
