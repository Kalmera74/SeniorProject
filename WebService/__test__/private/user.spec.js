// Test Requirements
import request from 'supertest';
import express from 'express';
import moment from 'moment';
import bodyParser from 'body-parser';

// Models
import UserModel from '../../models/user';

import server from '../../services/user_service';

const app = express();
app.use(bodyParser.json());
app.use(server);

describe('User Endpoints', () => {
  describe('Remove User', () => {
    let userID="test123", removedUserID;
    beforeEach(async (done) => {
      new UserModel({
       username:userID,
        password: '123456'
      })
        .save()
        .then((savedUser) => {
          // userID = savedUser.username;

          new UserModel({
            username:"test133",
            password: '123456',
            is_deleted: true,
          })
            .save()
            .then((savedUser) => {
              removedUserID = savedUser.username;
              done();
            });
        });
    });
    test('should be exists route', (done) => {
      request(app)
        .delete('/user/1')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    test('should be param id is string', (done) => {
      request(app)
        .delete('/user/1234')
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('username cant be number');
          done();
        });
    });

    
    test('should not remove non-exist user', (done) => {
      request(app)
        .delete('/user/' + 'avc')
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('No Rows Updated');
          done();
        });
    });


    test('should not remove already removed user', (done) => {
      request(app)
        .delete('/user/' + removedUserID)
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('No Rows Updated');
          done();
        });
    });





    test(`should remove user `, (done) => {
      request(app)
        .delete(`/user/${userID}`)
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.username).toBeTruthy();
          UserModel.where({ username: body.username })
            .fetch()
            .then((fetchedUser) => {
              expect(fetchedUser.get('is_deleted')).toBeTruthy();
              done();
            });
        });
    });
  });




  describe('List Users', () => {
    beforeEach(async (done) => {
      
      //  Creating 6 User (Deleted 3).
      
      Promise.all([
        new UserModel({
          username: 'test',
          password: '123456',
        }).save(),
        new UserModel({
          username: 'test2',
          password: '123456',
          is_deleted: true,
        }).save(),
        new UserModel({
          username: 'test3',
          password: '123456',
        }).save(),
        new UserModel({
          username: 'test4',
          password: '123456',
          is_deleted: true,
        }).save(),
        new UserModel({
          username: 'test5',
          password: '123456',
        }).save(),
        new UserModel({
          username: 'test6',
          password: '123456',
          is_deleted: true,
        }).save(),
      ]).then(() => {
        done();
      });
    });
    test('should be exists route', (done) => {
      request(app)
        .get('/user')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });

    test('should be list valid users(non-deleted)', (done) => {
      request(app)
        .get('/user')
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.data).toHaveLength(3);
          done();
        });
    });
  });
  
  
  test('should be create new ref code', (done) => {
    request(app)
      .get('/user/createRefLink')
      .expect(200)
      .end((err, res) => {
        expect(res.body.ref_code.length).toBe(15);
        expect(res.body.expires_at).toBe( moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'));
        done();
      });
  });

  test('should be set priority', async (done) => {
    let userId;

    userId = await new UserModel({
      username: 'testuser_priority',
      password: '123456',
      priority_key: 0,
    }).save().then((savedUser) => savedUser.id);

    request(app)
      .post('/user/setPriority')
      .send({userId, priority: 999})
      .expect(200)
      .end((err, res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.priority_key).toBe(999);
        done();
      });
  });

});
