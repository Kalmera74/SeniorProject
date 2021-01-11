// Test Requirements
import request from 'supertest';
import express from 'express';
import moment from 'moment';
import bodyParser from 'body-parser';

// Models
import AverageTimeModel from '../../models/averageTime';
import DeskModel from '../../models/desk';
import DeskUserModel from '../../models/deskUser';
import UserModel from '../../models/user';

import server from '../../services/queue_service';
import { Model } from 'bookshelf';

describe('Queue Process', () => {
  let app, userID;
  beforeAll(async (done) => {
    userID = await new UserModel({
      nationID: 123456,
      password: '123456',
      priority_key: 1,
    })
      .save()
      .then((savedUser) => savedUser.id);

    app = express();
    app.use(bodyParser.json());
    // Set default user
    app.use((req, res, next) => {
      req.userData = {
        uid: userID,
      };
      next();
    });
    app.use(server);
    done();
  });



  describe('Joining to a queue', () => {
    let deletedDesk, deactivatedDesk, normalDeskID;
    beforeEach(async () => {
      normalDeskID = await new DeskModel({
        name: 'test',
        is_active: true,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

      deactivatedDesk = await new DeskModel({
        name: 'test2',
        is_active: false,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

      deletedDesk = await new DeskModel({
        name: 'test3',
        is_active: false,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);
    });

    test('should be route exists', (done) => {
      request(app)
        .post('/queue/')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });


    test('should be add into valid desk', async (done) => {
      let userID;
      userID = await new UserModel({
        username: 'testxxxx',
        password: '123456',
        priority_key: 1,
      }).save().then( savedUser => savedUser.id);

      app.use((req, res, next) => {
        req.userData = {
            uid: userID,
          };
          next();
        });

      request(app)
        .post('/queue/')
        .send({
          deskId: normalDeskID,
        })
        .expect(200)
        .end((err, { body }) => {
          expect(err, body.message).toBeNull();
          expect(body.id).toBeGreaterThan(0);
          expect(body.desk_id).toBe(normalDeskID);
          expect(body.user_id).toBe(userID);
          expect(body.is_active).toBeTruthy();
          expect(body.is_finished).toBeFalsy();
          done();
        });
    });
  });

  describe('Giving Up a queue', () => {
    let deletedDesk, deactivatedDesk, normalDeskID, gaveUpDeskID;
    beforeEach(async () => {
      userID = await new UserModel({
        nationID: 4535675,
        password: '123456',
        priority_key: 1,
      })
        .save()
        .then((savedUser) => savedUser.id);
  
      normalDeskID = await new DeskModel({
        name: 'test',
        is_active: true,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

      gaveUpDeskID = await new DeskModel({
        name: 'test',
        is_active: true,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

      deactivatedDesk = await new DeskModel({
        name: 'test2',
        is_active: false,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

      deletedDesk = await new DeskModel({
        name: 'test3',
        is_active: false,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

      await new DeskUserModel({
        desk_id: normalDeskID,
        user_id: userID,
      }).save();

      await new DeskUserModel({
        desk_id: gaveUpDeskID,
        user_id: userID,
        is_active: false,
      }).save();
    });
    test('should be route exists', (done) => {
      request(app)
        .delete('/queue/')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });

    test('should be desk_id defined', (done) => {
      request(app)
        .delete('/queue/')
        .expect(400)
        .end((err, { body }) => {
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('deskId must be exists');
          expect(err).toBeNull();
          done();
        });
    });


    test('should be desk exists and active', (done) => {
      request(app)
        .delete('/queue/')
        .send({
          deskId: 999,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNull();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('desk must be valid');
          done();
        });
    });
    test('should be active desk', (done) => {
      request(app)
        .delete('/queue/')
        .send({
          deskId: deactivatedDesk,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNull();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('desk must be valid');
          done();
        });
    });
    test('should be not deleted desk', (done) => {
      request(app)
        .delete('/queue/')
        .send({
          deskId: deletedDesk,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNull();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('desk must be valid');
          done();
        });
    });

    test('should not give up already given up desk', (done) => {
      request(app)
        .delete('/queue/')
        .send({
          deskId: gaveUpDeskID,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err, body.message).toBeNull();
          expect(body.error).toBeDefined();
          expect(body.message).toBe('user has not been given up');
          done();
        });


    });
    test('should give up from valid desk', (done) => {
      request(app)
        .delete('/queue/')
        .send({
          deskId: normalDeskID,
        })
        .expect(200)
        .end((err, { body }) => {
          expect(err, body.message).toBeNull();
          expect(body.id).toBeGreaterThan(0);
          expect(body.desk_id).toBe(normalDeskID);
          expect(body.user_id).toBe(userID);
          expect(body.is_active).toBeFalsy();
          expect(body.is_finished).toBeFalsy();
          done();
        });
    });
  });

  describe('Get Stats', () => {
    test('should be occupancy route exists', (done) => {
      request(app)
        .get('/queue/occupancy/' + 1)
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    test('should be info route exists', (done) => {
      request(app)
        .get('/queue/info/' + 1)
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    describe('Occupancy', () => {
      let normalDeskID, userID;
      beforeEach(async () => {
        userID = await new UserModel({
          nationID: 987678,
          password: '123456',
          priority_key: 1,
        })
          .save()
          .then((savedUser) => savedUser.id);
    
        normalDeskID = await new DeskModel({
          name: 'test',
          is_active: true,
          is_deleted: false,
        }).save().then( (saved) => saved.id);

        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
          is_active: false,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
          is_finished: true,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
      });

      test('should desk id is number', (done) => {
        request(app)
          .get('/queue/occupancy/asd')
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('deskId must be number');
            done();
          });
      });
      test('should be route exists', (done) => {
        request(app)
          .get('/queue/occupancy/' + 1)
          .end((err, res) => {
            expect(res.status).not.toBe(404);
            done();
          });
      });

      test('should get current occupancy', (done) => {
        request(app)
          .get('/queue/occupancy/' + 1)
          .expect(200)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.total).toBe(3);
            done();
          });
      });
    });

    
    describe('Info', () => {
      let queueNumber, normalDeskID, userID;
      beforeEach(async () => {
        /* 
          Last Average Time 5
          7 User (1 Finished, 1 deActivated) Front 
          3 User (1 Finished) Back
          Total : 7
          Waiting Time : 25
        */
       userID = await new UserModel({
        nationID: 987678,
        password: '123456',
        priority_key: 1,
      })
        .save()
        .then((savedUser) => savedUser.id);
        
       normalDeskID = await new DeskModel({
        name: 'test',
        is_active: true,
        is_deleted: false,
      })
        .save()
        .then((savedDesk) => savedDesk.id);

        await new AverageTimeModel({
          desk_id: normalDeskID,
          time: 10,
        }).save();
        await new AverageTimeModel({
          desk_id: normalDeskID,
          time: 5,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
          is_active: false,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
          is_finished: true,
        }).save();
        // Current User
        queueNumber = await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        })
          .save()
          .then((savedQueue) => savedQueue.id);
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
          is_finished: true,
        }).save();
        await new DeskUserModel({
          user_id: userID,
          desk_id: normalDeskID,
        }).save();
      });
      test('should queue number is number', (done) => {
        request(app)
          .get('/queue/info/asd')
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('queue number must be number');
            done();
          });
      });
      test('should queue number must be valid', (done) => {
        request(app)
          .get('/queue/info/9999')
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('queue number does not exists');
            done();
          });
      });
      test('should get correct info with queue number', (done) => {
        request(app)
          .get('/queue/info/' + queueNumber)
          .expect(200)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.avgTime).toBe(5);
            expect(body.frontCount).toBe(5);
            expect(body.waitingTime).toBe(25);
            done();
          });
      });
    });
  });
});
