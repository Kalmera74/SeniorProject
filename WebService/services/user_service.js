import express from 'express';
import moment from 'moment';
import cryptoRandomString from 'crypto-random-string';
// Models
import UserModel from '../models/user';
import RefModel from '../models/refLink';

// Utils
import {errorResp, successResp} from '../util/http_util';
const router = express.Router();

// Endpoints

// Removes portal user by admin
//check username if exists change delete is true
const removeUser = (req, res) => {
    const {username} = req.params;

    if (Number.isInteger(Number(username))) {
        errorResp(res, new Error('username cant be number'));
        return;
    }

    UserModel.where({username:username, is_deleted: false})
        .save({is_deleted: true}, {method: 'update'})
        .then(() => {
            successResp(res, {username});
        })
        .catch((err) => {
            errorResp(res, err);
        });
};


// list users
//list users which are not deleted
//give only 2 colums rest are not required
const listUsers = (req, res) => {
    UserModel.where({is_deleted: false})
        .fetchAll({
            columns: ['id', 'username'],
            require: false,
        })
        .then((result) => {
            successResp(res, {data: result});
        })
        .catch((err) => {
            console.error(err);
            errorResp(res, new Error('error occurs when listing users'));
        });
};

/*
    Create ref link for register as portal user
*/

// creating new referance link for portal to be used 15 character
//expire date 1 day

const createRefLink = (req, res) => {

    let ref = cryptoRandomString({length: 15});
    let expireDate = moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
    new RefModel({
        ref_code: ref,
        expires_at: expireDate
    })
        .save()
        .then((result) => {
            successResp(res, {ref_code: result.get('ref_code'), expires_at: expireDate});
        })
        .catch((err) => {
            errorResp(res, err);
        });
};


/* no need right now if 2 admin needs to login or change portal to user to admin user
    Set priority the user 
    
    0 => User
    10 => Portal User
    3 => Admin
*/
const setPriority = (req, res) => {
    const {priority, userId} = req.body;
    
    if (!Number.isInteger(Number(userId))) {
        errorResp(res, new Error('userId must be number'));
        return;
    }
    if (!Number.isInteger(Number(priority))) {
        errorResp(res, new Error('priority must be number'));
        return;
    }
    
    UserModel
        .where('id', userId)
        .fetch({require: true})
        .then((result) => {
            UserModel.where('id', userId).save(
                {
                    priority_key: priority
                },
                {
                    method: 'update',
                }
            ).then((updateResult) => {
                successResp(res, {
                    id: updateResult.get('id'),
                    priority_key: updateResult.get('priority_key')
                });
            }) 
            
        })
        .catch((err) => {
            console.log(err);
            errorResp(res, new Error('error occurs when setting priority'));
        });
};


router.route('/user/:username').delete(removeUser);
router.route('/user').get(listUsers);
router.route('/user/createRefLink').get(createRefLink);
router.route('/user/setPriority').post(setPriority);

export default router;

