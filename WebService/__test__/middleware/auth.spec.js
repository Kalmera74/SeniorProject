// Test Requirements
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

// Models
import QrCode from '../../models/qrCode';

// Config
import config from 'config';

const { auth } = config;

import middleware from '../../middleware/auth';

const app = express();
app.use(bodyParser.json());
app.use(middleware);
app.route('/test').post((req, res) => {
  res.status(200).json(req.userData);
});

describe('Auth Middleware', () => {
  let token;
  beforeEach(() => {
    token = jwt.sign(
      {
        uid: 10,
        utype: 1,
        uname: 'test',
      },
      auth.secret,
      { expiresIn: auth.expiredTime }
    );
  });

  test('should check undefined authorization token', async (done) => {
    request(app)
      .post('/test')
      .expect(401)
      .end((err, res) => {
        expect(err).toBeNil();
        done();
      });
  });

  test('should check invalid authorization token', async (done) => {
    request(app)
      .post('/test')
      .set('Authentication', 'testtest')
      .expect(401)
      .end((err, res) => {
        expect(err).toBeNil();
        done();
      });
  });

  test('should check correct authorization token', async (done) => {
    request(app)
      .post('/test')
      .set('Authentication', token)
      .expect(200)
      .end((err, { body }) => {
        expect(err).toBeNil();
        expect(body).toHaveProperty('uid', 10);
        expect(body).toHaveProperty('utype', 1);
        expect(body).toHaveProperty('uname', 'test');
        done();
      });
  });
});
