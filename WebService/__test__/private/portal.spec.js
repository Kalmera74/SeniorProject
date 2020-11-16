// Test Requirements
import request from 'supertest';
import express from 'express';
import moment from 'moment';
import bodyParser from 'body-parser';

// Models
import AverageTimeModel from '../../models/averageTime';
import DeskModel from '../../models/desk';
import UserModel from '../../models/user';
import DeskUserModel from '../../models/deskUser';

import server from '../../services/portal_service';

const app = express();
app.use(bodyParser.json());
app.use(server);

describe('Portal User Endpoints', () => {

  test('should get correct average time of all desks', async (done) => {

    await new AverageTimeModel({ time: 10, desk_id: 1 }).save();
    await new AverageTimeModel({ time: 20, desk_id: 2 }).save();
    await new AverageTimeModel({ time: 30, desk_id: 3 }).save();

    request(app)
      .get('/getStatistics')
      .expect(200)
      .end((err, res) => {
        expect(res.body.error, res.body.message).toBeUndefined();
        expect(err).toBeNil();
        expect(res.body.AverageTime).toBe(20);
        done();
      });
  });
  
  test('should username must be valid', (done) => {
    request(app)
      .get('/getUserStatisticsByUsername/nobody')
      .expect(400)
      .end((err, res) => {
        expect(err).toBeNull();
        expect(res.body.error).toBeTruthy();
        expect(res.body.message).toBe('user not exists');
        done();
      });
  });

  test('should get correct data by username', async (done) => {
      let userId;
      let deskId = [];
      deskId.push(await new DeskModel({ name: 'desk0'}).save().then((saved) => saved.id));
      deskId.push(await new DeskModel({ name: 'desk1'}).save().then((saved) => saved.id));

      let finishedAt = moment().add(-1, 'days').format('YYYY-MM-DD HH:mm:ss');
      userId = await new UserModel({
        username: 'testuser',
        password: '123456',
        priority_key: 1,
      }).save().then((savedUser) => savedUser.id);

      await new DeskUserModel({ user_id: userId, desk_id: deskId[0], is_active: true, is_finished: false }).save();
      await new DeskUserModel({ user_id: userId, desk_id: deskId[1], is_active: false, is_finished: true, finished_at: finishedAt}).save();
      await new DeskUserModel({ user_id: userId, desk_id: deskId[0], is_active: false, is_finished: false }).save();
      
    request(app)
      .get('/getUserStatisticsByUsername/testuser')
      .expect(200)
      .end((err, res) => {
        expect(res.body.error, res.body.message).toBeUndefined();
        expect(err).toBeNil();
        expect(res.body.user.id).toBe(userId);
        expect(res.body.operations.length).toBe(3);
        expect(res.body.operations[0].is_active).toBe(true);
        expect(res.body.operations[0].is_finished).toBe(false);
        expect(res.body.operations[1].is_active).toBe(false);
        expect(res.body.operations[1].is_finished).toBe(true);
        expect(res.body.operations[1].finished_at).toBeTruthy();
        expect(res.body.operations[2].is_active).toBe(false);
        expect(res.body.operations[2].is_finished).toBe(false);
        expect(res.body.operations[2].finished_at).toBe(null);
        done();
      });
  });

  test('should calculate correct average times', async (done) => {
    let userId;

    let deskId = [];
    deskId.push(await new DeskModel({ name: 'desk0'}).save().then((saved) => saved.id));
    deskId.push(await new DeskModel({ name: 'desk1'}).save().then((saved) => saved.id));
    deskId.push(await new DeskModel({ name: 'desk2'}).save().then((saved) => saved.id));
    deskId.push(await new DeskModel({ name: 'desk3'}).save().then((saved) => saved.id));

    userId = await new UserModel({
      username: 'testuser',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);
    await new DeskUserModel({ user_id: userId, desk_id: deskId[0], is_active: false, is_finished: true, created_at:moment().format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId[1], is_active: false, is_finished: true, created_at:moment().add(-70, 'minutes').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-70, 'minutes').add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId[0], is_active: false, is_finished: true, created_at:moment().add(-90, 'minutes').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-90, 'minutes').add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId[2], is_active: false, is_finished: true, created_at:moment().add(-1, 'months').add(1,'days').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'months').add(5, 'minutes').add(1,'days').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId[3], is_active: false, is_finished: true, created_at:moment().add(-1, 'years').add(1,'days').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'years').add(2, 'minutes').add(1,'days').format('YYYY-MM-DD HH:mm:ss')}).save();
  
    userId = await new UserModel({
      username: 'testuser2',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);
    await new DeskUserModel({ user_id: userId, desk_id: deskId[0], is_active: false, is_finished: true, created_at:moment().add(-70, 'minutes').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-70, 'minutes').add(2, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId[2], is_active: false, is_finished: true, created_at:moment().add(-1, 'months').add(1,'days').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'months').add(1,'days').add(6, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId[1], is_active: false, is_finished: true, created_at:moment().add(-1, 'years').add(1,'days').format('YYYY-MM-DD HH:mm:ss') , finished_at: moment().add(-1, 'years').add(1,'days').add(8, 'minutes').format('YYYY-MM-DD HH:mm:ss')}).save();

  request(app)
    .get('/calculateAverageTimes')
    .expect(200)
    .end((err, res) => {
      expect(res.body.error, res.body.message).toBeUndefined();
      expect(err).toBeNil();
      expect(res.body.desks.hourly.averageTime).toBe(60);
      expect(res.body.desks.daily.averageTime).toBe(195);
      expect(res.body.desks.weekly.averageTime).toBe(195);
      expect(res.body.desks.monthly.averageTime).toBe(240);
      expect(res.body.desks.yearly.averageTime).toBe(255);
      done();
    });
});

describe('Correct Portal Statistics', () => {
  test('should get correct given up users', async (done) => {

    let deskId = 0;
    deskId = await new DeskModel({ name: 'desk0'}).save().then((saved) => saved.id);

    let userId = 0;
    
    userId = await new UserModel({
      username: 'testuser',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);

    //3 given up user
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: true}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: false}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: false}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: false}).save();

    request(app)
    .get('/getPortalStatistics')
    .expect(200)
    .end((err, res) => {
      expect(res.body.error, res.body.message).toBeUndefined();
      expect(err).toBeNil();
      expect(res.body.givenUpUsers).toBe('3');
      done();
    });
  });

  test('should get correct online users', async (done) => {
    let deskId = 0;
    deskId = await new DeskModel({ name: 'desk0'}).save().then((saved) => saved.id);
    let userId = 0;
    userId = await new UserModel({
      username: 'testuser',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);

    //2 online users
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: true}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: true, is_finished: false}).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: true, is_finished: false}).save();

    request(app)
    .get('/getPortalStatistics')
    .expect(200)
    .end((err, res) => {
      expect(res.body.error, res.body.message).toBeUndefined();
      expect(err).toBeNil();
      expect(res.body.onlineUsers).toBe('2');
      done();
    });
  });


  
  test('should get correct portal statistics', async (done) => {
    let deskId = 0;
    deskId = await new DeskModel({ name: 'desk1'}).save().then((saved) => saved.id);
    //100
    await new AverageTimeModel({ time: 80, desk_id: deskId}).save();
    await new AverageTimeModel({ time: 120, desk_id: deskId}).save();
    //dont calculate
    deskId = await new DeskModel({ name: 'desk2', is_active: false}).save().then((saved) => saved.id);
    //80
      await new AverageTimeModel({ time: 40, desk_id: deskId}).save();
      await new AverageTimeModel({ time: 120, desk_id: deskId}).save();
    deskId = await new DeskModel({ name: 'desk3'}).save().then((saved) => saved.id);
    //30
      await new AverageTimeModel({ time: 10, desk_id: deskId}).save();
      await new AverageTimeModel({ time: 20, desk_id: deskId}).save();
      await new AverageTimeModel({ time: 60, desk_id: deskId}).save();
  
      await new DeskModel({ name: 'desk4', is_active: false}).save().then((saved) => saved.id);
  
    request(app)
    .get('/getPortalStatistics')
    .expect(200)
    .end((err, res) => {
      expect(res.body.error, res.body.message).toBeUndefined();
      expect(err).toBeNil();
      expect(res.body.desks[0].time).toBe('100');
      expect(res.body.desks[1].time).toBe('30');
      done();
    });
  
  });

});



});
