import express from 'express';
import moment from 'moment';
// Models
import UserModel from '../models/user';
import RefModel from '../models/refLink';
// Utils
import {errorResp, successResp} from '../util/http_util';
const router = express.Router();

// Endpoints
const removeUser = (req, res) => {
    const {id} = req.params;

    if (!Number.isInteger(Number(id))) {
        errorResp(res, new Error('id must be number'));
        return;
    }

    UserModel.where({id, is_deleted: false})
        .save({is_deleted: true}, {method: 'update'})
        .then(() => {
            successResp(res, {id});
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

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

const createRefLink = (req, res) => {

    let ref = randomString(15);
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

/*
    Create a random string
*/
const randomString = (length) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/*
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

router.route('/user/:id').delete(removeUser);
router.route('/user').get(listUsers);
router.route('/user/createRefLink').get(createRefLink);
router.route('/user/setPriority').post(setPriority);

export default router;
