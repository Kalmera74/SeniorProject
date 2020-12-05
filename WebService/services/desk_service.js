import moment from 'moment';
import express from 'express';
// Models
import DeskModel from '../models/desk';
import AverageTimeModel from '../models/averageTime';
// Utils
import {errorResp, successResp} from '../util/http_util';

// Endpoints

//Accessible by admin only

const createDesk = (req, res) => {
    const {name} = req.body;

    if (!name) {
        errorResp(res, new Error('Name must be exists'));
        return;
    }
    new DeskModel({
        name,
    })
        .save()
        .then((savedDesk) => {
            successResp(res, savedDesk, 201);
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

/*
  // Delete desk from system
*/
const removeDesk = (req, res) => {
    const {id} = req.params;
    if (!Number.isInteger(Number(id))) {
        errorResp(res, new Error('id must be number'));
        return;
    }

    new DeskModel()
        .where({id, is_deleted: false})
        .save(
            {
                is_deleted: true,
            },
            {
                method: 'update',
            }
        )
        .then(() => {
            successResp(res, {id});
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

/*
  List desk without deleted ones
*/
const listDesks = (req, res) => {
    DeskModel.where({
        is_deleted: false,
    })
        .fetchAll({
            columns: ['id', 'name', 'is_active', 'created_at'],
            require: false,
        })
        .then((result) => {
            successResp(res, {data: result});
        });
};
/*
  Activate / Deactivate a desk
*/
const setActivityToDesk = (req, res) => {

    const {status} = req.body;
    const {id} = req.params;

    if (!Number.isInteger(Number(id))) {
        errorResp(res, new Error('id must be number'));
        return;
    }

    if (status === undefined) {
        errorResp(res, new Error('status must be exists'));
        return;
    }

    DeskModel.where({id, is_active: !status})
        .save({is_active: status}, {method: 'update'})
        .then(() => {
            successResp(res, {id, status});
        })
        .catch((err) => {
            errorResp(res, new Error('No Rows Updated'));
        });

};
// Adjust Average time
const setAverageTime = (req, res) => {

    const {time, deskId} = req.body || {};

    if (Number(time) <= 0) {
        errorResp(res, new Error('Time must be greater than zero'));
        return;
    }

    const insertData = {
        time,
        desk_id: deskId,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    new AverageTimeModel(insertData)
        .save()
        .then((savedAvgTime) => {
            successResp(res, {
                time: savedAvgTime.get('time'),
                created_at: savedAvgTime.get('created_at'),
            });
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

// Get average time
//this function getch avg time from db and send back response to user

const getAverageTime = (req, res) => {

    const {deskId} = req.query;

    new AverageTimeModel()
        .where('desk_id', deskId)
        .orderBy('id', 'desc')
        .fetch({
            columns: ['time', 'created_at'],
            require: false,
        })
        .then((result) => {
            successResp(res, result);
        })
        .catch((err) => {
            errorResp(res, err);
        });
};

const router = express.Router();

router.route('/desk').post(createDesk).get(listDesks);

router.route('/desk/:id').delete(removeDesk).put(setActivityToDesk);

router.route('/desk/stats/time').post(setAverageTime).get(getAverageTime);

export default router;
