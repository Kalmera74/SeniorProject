// Test Requirements
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

// Config
import config from 'config';

import middleware from '../../middleware/portal_user';

describe('Portal Middleware', () => {
  describe('Unauthorized', () => {
    let app;
    beforeEach(() => {
      app = express();
      app.use(bodyParser.json());
      app.use((req, res, next) => {
        req.userData = {
          utype: 1,
        };
        next();
      });
      app.use(middleware);
      app.route('/test').post((req, res) => {
        res.status(200).json({
          data: 'test',
        });
      });
    });
    test('should check unauthorized user logged', async (done) => {
      request(app)
        .post('/test')
        .expect(401)
        .end((err, res) => {
          expect(err).toBeNil();
          done();
        });
    });
  });

  describe('Authorized', () => {
    let app;
    beforeEach(() => {
      app = express();
      app.use(bodyParser.json());
      app.use((req, res, next) => {
        req.userData = {
          utype: 10,
        };
        next();
      });
      app.use(middleware);
      app.route('/test').post((req, res) => {
        res.status(200).json({
          data: 'test',
        });
      });
    });
    test('should check authorized portal user logged', async (done) => {
      request(app)
        .post('/test')
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.data).toBe('test');
          done();
        });
    });
  });
});
