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

import server from '../../services/user_info_service';

const app = express();
app.use(bodyParser.json());



describe('User Info Endpoints', () => {

  test('should get correct user info', async (done) => {
    let userId;
      userId = await new UserModel({
        username: 'testuser',
        password: '123456',
        priority_key: 199,
      }).save().then((savedUser) => savedUser.id);

      let deskId = 0;
      deskId = await new DeskModel({ name: 'desk1'}).save().then((saved) => saved.id);

    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: true, is_finished: false }).save();
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: false }).save();

    deskId = await new DeskModel({ name: 'desk2'}).save().then((saved) => saved.id);
    await new DeskUserModel({ user_id: userId, desk_id: deskId, is_active: false, is_finished: true}).save();


    app.use((req, res, next) => {
    req.userData = {
        uid: userId,
      };
      next();
    });
    app.use(server);
    request(app)
      .get('/user/getStatistics')
      .expect(200)
      .end((err, res) => {
        
        expect(res.body.error, res.body.message).toBeUndefined();
        expect(err).toBeNil();
        
        expect(res.body.user.id).toBe(userId);
        expect(res.body.user.username).toBe('testuser');
        expect(res.body.user.priority_key).toBe(199);

        expect(res.body.operations.length).toBe(3);

        expect(res.body.operations[0].user_id).toBe(userId);
        expect(res.body.operations[1].user_id).toBe(userId);
        expect(res.body.operations[2].user_id).toBe(userId);
        expect(res.body.operations[0].is_active).toBe(true);
        expect(res.body.operations[1].is_active).toBe(false);
        expect(res.body.operations[1].is_finished).toBe(false);

        done();




        
      });
  });
  
});
