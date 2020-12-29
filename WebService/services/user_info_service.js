import express from 'express';
// Models
import UserModel from '../models/user';
import DeskUserModel from '../models/deskUser';
// Utils that determine response type
import {errorResp, successResp} from '../util/http_util';

// Endpoints

//  Get the data operations of authenticated user.
// This function checks id is match or not and return the data that user have.
const getUserStatistics = (req, res) => {
    const {uid} = req.userData;

    new UserModel()
        .where('id', uid)
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
            errorResp(res, err);
        });
};

const router = express.Router();

router.route('/user/getStatistics').get(getUserStatistics);

export default router;
