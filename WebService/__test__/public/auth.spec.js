// Test Requirements
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import moment from 'moment';
// Models
import UserModel from '../../models/user';
import PriorityModel from '../../models/priority';
import RefLink from '../../models/refLink';

import server from '../../services/auth_service';

const app = express();
app.use(bodyParser.json());
app.use(server);

describe('Auth Routes', () => {
  let clientID, portalID, mobileID, refCode;
  beforeEach(async (done) => {
    await new PriorityModel({
      type: 'Admin',
    })
      .save()
      .then(({ id }) => {
        clientID = id;
      });

    await new PriorityModel({
      type: 'Portal',
    })
      .save()
      .then(({ id }) => {
        portalID = id;
      });

    await new PriorityModel({
      type: 'Mobile',
    })
      .save()
      .then(({ id }) => {
        mobileID = id;
      });

    await new RefLink({
      ref_code: 'testrefcode',
      expires_at: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
    }) .save()
    .then(({ ref_code }) => {
      refCode = ref_code;
    });


    done();
  });

  describe('Register', () => {
    test('should register route exists and return something', async (done) => {
      request(app)
        .post('/mobileRegister')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });

    test('should includes username and password', async (done) => {
      request(app)
        .post('/mobileRegister')
        .send({
          nationID:123456
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();


          expect(body.message).toBe('nationID and Password are required');
          request(app)
            .post('/mobileRegister')
            .send({
              password: 'test',
            })
            .expect(400)
            .end((err, { body }) => {
              expect(err).toBeNil();

              expect(body.error).toBeTruthy();
              expect(body.message).toBe('nationID and Password are required');
              done();
            });
        });
    });

    test('should not include create user with used username', async (done) => {
      await new UserModel({
        nationID:123456,
        password: 123456,
        priority_key: 2,
      }).save();

      request(app)
        .post('/mobileRegister')
        .send({
          nationID:123456,
          password: 123456,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();

          expect(body.message).toBe('nationID Already Used');
          done();
        });
    });

    test('should create a new user with username and password', async (done) => {
      request(app)
        .post('/mobileRegister')
        .send({
          nationID:123456,
          password: '123456',
        })
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body).toHaveProperty('nationID', 123456);
          UserModel.where({ nationID:123456 })
            .fetch()
            .then((result) => {
              expect(result).toBeTruthy();
              done();
            })
            .catch(done);
        });
    });

    test('should hash password of new user ', async (done) => {
      request(app)
        .post('/mobileRegister')
        .send({
          nationID:123456,
          password: '123456',
        })
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          UserModel.where({ nationID:123456 })
            .fetch()
            .then((result) => {
              expect(result.get('password')).not.toBe('123456');
              UserModel.verify('123456', result.get('password')).then(
                (isMatched) => {
                  expect(isMatched).toBe(true);
                  done();
                }
              );
            })
            .catch(done);
        });
    });
  });

  describe('Login', () => {
    test('should login route exists and return something', async (done) => {
      request(app)
        .post('/mobileLogin')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });

    test('should login includes username and password', async (done) => {
      request(app)
        .post('/mobileLogin')
        .send({
          nationID:123456,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('nationID and Password are required');

          request(app)
            .post('/mobileLogin')
            .send({
              password: '123456',
            })
            .expect(400)
            .end((err, { body }) => {
              expect(err).toBeNil();
              expect(body.error).toBeTruthy();
              expect(body.message).toBe('nationID and Password are required');
              done();
            });
        });
    });

    describe('Login Process', () => {
      beforeEach(async (done) => {


        await new UserModel({
          nationID:123456,
          password: '123456',
          priority_key: 2,
        }).save();



        
        await new UserModel({
          nationID:1234568,
          password: '654321',
          priority_key: 2,
        }).save();
        done();
      });

      test('should not login wrong password', async (done) => {
        request(app)
          .post('/mobileLogin')
          .send({
            nationID:123456,
            password: '123asd',
          })
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNil();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('Wrong Password');
            done();
          });
      });

      test('should not login wrong username', async (done) => {
        request(app)
          .post('/mobileLogin')
          .send({
            nationID:1233456,
            password: '123456',
          })
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNil();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('Non-exists nationID');
            done();
          });
      });

      test('should login correct username and password, return token', async (done) => {
        request(app)
          .post('/mobileLogin')
          .send({
            nationID:123456,
            password: '123456',
          })
          .expect(200)
          .end((err, { body: { token, nationID, priority } }) => {
            expect(err).toBeNil();
            expect(token.length).toBeGreaterThan(10);
            expect(nationID).toBe(123456);
            expect(priority).toBe(2);
            done();
          });
      });
    });
  });
});
