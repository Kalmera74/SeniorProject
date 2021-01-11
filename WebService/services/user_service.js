import express from 'express';
import moment from 'moment';
import cryptoRandomString from 'crypto-random-string';
// Models
import UserModel from '../models/user';
import RefModel from '../models/refLink';

// Utils that determine response type
import {errorResp, successResp} from '../util/http_util';
const router = express.Router();

// Endpoints

// Remove portal user by admin.

//This function checks if username is valid and in the database or not and change "is_deleted" value to the true.
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


// This function query databse for active users.
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

// Creating new referance link for to be used in the registeration as portal user.
// Link expire date set to 1 day.

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

// This fucntion change users' priviledge.
// Set priority the user  
//    0 =>  Mobile User
//    10 => Portal User
//    3 =>  Admin

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

