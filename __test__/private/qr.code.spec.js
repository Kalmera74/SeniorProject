// Test Requirements
import request from 'supertest';
import express from 'express';
import moment from 'moment';
import bodyParser from 'body-parser';

// Models
import QrCode from '../../models/qrCode';

import server from '../../services/qr_code_service';
const app = express();
app.use(bodyParser.json());
app.use(server);

describe('QR Code Endpoints', () => {
  describe('Generate QR', () => {
    test('should generate qr', (done) => {
      request(app)
        .post('/qr')
        .expect(201)
        .end((err, res) => {
          expect(res.body.error, res.body.message).toBeUndefined();
          expect(err).toBeNil();
          const returnData = res.body;
          expect(returnData).toHaveProperty('code');
          expect(returnData).toHaveProperty('isActive');
          done();
        });
    });
  });
  describe('Use QR', () => {
    const sampleCode = 2321;
    const sampleUsedCode = 5678;

    beforeEach((done) => {
      new QrCode({
        code: sampleCode,
        isActive: true,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      })
        .save()
        .then(() => {
         new QrCode({
            code: sampleUsedCode,
            isActive: false,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
          })
            .save()
            .then(() => {
              done();
            });
        });
    });

    test('should use existing qr', (done) => {
      request(app)
        .put('/qr/2321')
        .expect(200)
        .end((err, res) => {
          expect(res.body.error, res.body.message).toBeUndefined();
          expect(err).toBeNil();
          done();
        });
    });

    test('should not use non-existing qr', (done) => {
      request(app)
        .put('/qr/0000')
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNil();
          expect(res.body.error, res.body.message).toBeDefined();
          done();
        });
    });

    test('should not use already used qr', (done) => {
      request(app)
        .put('/qr/5678')
        .expect(400)
        .end((err, res) => {
          expect(err).toBeNil();
          expect(res.body.error, res.body.message).toBeDefined();
          done();
        });
    });
  });
});
