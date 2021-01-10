// Test Requirements
import request from 'supertest';
import express from 'express';
import moment from 'moment';
import bodyParser from 'body-parser';

// Models
import AverageTimeModel from '../../models/averageTime';
import DeskModel from '../../models/desk';
import DeskUserModel from '../../models/deskUser';

import server from '../../services/desk_service';
import { Model } from 'bookshelf';
const app = express();
app.use(bodyParser.json());
app.use(server);

describe('Desk Endpoints', () => {
  describe('Create Desk', () => {
    test('should be exists route', (done) => {
      request(app)
        .post('/desk/')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    test('should name be defined', (done) => {
      request(app)
        .post('/desk/')
        .send({
          name: '',
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('Name must be exists');
          done();
        });
    });
    test('should create desk', (done) => {
      request(app)
        .post('/desk/')
        .send({
          name: 'test',
        })
        .expect(201)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.id).toBeTruthy();
          expect(body.name).toBe('test');

          DeskModel.where({ id: body.id })
            .fetch()
            .then((savedDesk) => {
              expect(savedDesk.get('name')).toBe(body.name);
              expect(savedDesk.get('is_active')).toBeTruthy();
              expect(savedDesk.get('is_deleted')).toBeFalsy();
              done();
            });
        });
    });
  });
  describe('Remove Desk', () => {
    let deskID, removedDeskID;
    beforeEach(async (done) => {
      new DeskModel({
        name: 'test',
      })
        .save()
        .then((savedDesk) => {
          deskID = savedDesk.id;

          new DeskModel({
            name: 'test',
            is_deleted: true,
          })
            .save()
            .then((savedDesk) => {
              removedDeskID = savedDesk.id;
              done();
            });
        });
    });
    test('should be exists route', (done) => {
      request(app)
        .delete('/desk/1')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    test('should be param id as number', (done) => {
      request(app)
        .delete('/desk/ads')
        .send({
          name: '',
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('id must be number');
          done();
        });
    });
    test('should not remove non-exist desk', (done) => {
      request(app)
        .delete('/desk/' + 10)
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('No Rows Updated');
          done();
        });
    });
    test('should not remove already removed desk', (done) => {
      request(app)
        .delete('/desk/' + removedDeskID)
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('No Rows Updated');
          done();
        });
    });
    test('should remove desk', (done) => {
      request(app)
        .delete('/desk/' + deskID)
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.id).toBeTruthy();
          DeskModel.where({ id: body.id })
            .fetch()
            .then((savedDesk) => {
              expect(savedDesk.get('is_deleted')).toBeTruthy();
              done();
            });
        });
    });
  });

  describe('List Desks', () => {
    beforeEach(async (done) => {
      
    //Creating 6 Desk (Deleted 3)
      
      Promise.all([
        new DeskModel({
          name: 'test',
        }).save(),
        new DeskModel({
          name: 'test2',
          is_deleted: true,
        }).save(),
        new DeskModel({
          name: 'test3',
        }).save(),
        new DeskModel({
          name: 'test4',
          is_deleted: true,
        }).save(),
        new DeskModel({
          name: 'test5',
        }).save(),
        new DeskModel({
          name: 'test6',
          is_deleted: true,
        }).save(),
      ]).then(() => {
        done();
      });
    });
    test('should be exists route', (done) => {
      request(app)
        .get('/desk')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    test('should be list valid desks(non-deleted)', (done) => {
      request(app)
        .get('/desk')
        .expect(200)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.data).toHaveLength(3);
          done();
        });
    });
  });

  describe('Activate/Deactivate Desk', () => {
    test('should be exists route', (done) => {
      request(app)
        .put('/desk/1')
        .end((err, res) => {
          expect(res.status).not.toBe(404);
          done();
        });
    });
    test('should status exists', (done) => {
      request(app)
        .put('/desk/1')
        .send({})
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeDefined();
          expect(body.message).toBe('status must be exists');
          done();
        });
    });
    test('should be param id as number', (done) => {
      request(app)
        .put('/desk/ads')
        .send({
          name: '',
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('id must be number');
          done();
        });
    });
    test('should not remove non-exist desk', (done) => {
      request(app)
        .put('/desk/' + 10)
        .send({
          status: false,
        })
        .expect(400)
        .end((err, { body }) => {
          expect(err).toBeNil();
          expect(body.error).toBeTruthy();
          expect(body.message).toBe('No Rows Updated');
          done();
        });
    });

    describe('Setting Status', () => {
      let activatedDeskID, deactivatedDeskID;
      beforeEach(async (done) => {
        new DeskModel({
          name: 'test',
          is_active: true,
        })
          .save()
          .then((savedDesk) => {
            activatedDeskID = savedDesk.id;
            new DeskModel({
              name: 'test',
              is_active: false,
            })
              .save()
              .then((savedDesk) => {
                deactivatedDeskID = savedDesk.id;
                done();
              });
          });
      });

      test('should not activate already activated desk', (done) => {
        request(app)
          .put('/desk/' + activatedDeskID)
          .send({
            status: true,
          })
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('No Rows Updated');
            done();
          });
      });

      test('should activate deactivated desk', (done) => {
        request(app)
          .put('/desk/' + deactivatedDeskID)
          .send({
            status: true,
          })
          .expect(200)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.id).toBeTruthy();
            DeskModel.where({ id: body.id })
              .fetch()
              .then((updatedDesk) => {
                expect(updatedDesk.get('is_active')).toBeTruthy();
                done();
              });
          });
      });

      test('should deactivate activated desk', (done) => {
        request(app)
          .put('/desk/' + activatedDeskID)
          .send({
            status: false,
          })
          .expect(200)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.id).toBeTruthy();
            DeskModel.where({ id: body.id })
              .fetch()
              .then((updatedDesk) => {
                expect(updatedDesk.get('is_active')).toBeFalsy();
                done();
              });
          });
      });

      test('should not deactivate already deactivated desk', (done) => {
        request(app)
          .put('/desk/' + deactivatedDeskID)
          .send({
            status: false,
          })
          .expect(400)
          .end((err, { body }) => {
            expect(err).toBeNull();
            expect(body.error).toBeTruthy();
            expect(body.message).toBe('No Rows Updated');
            done();
          });
      });
    });
  });
});

describe('Average Time', () => {
  let deskID;

  beforeEach(async (done) => {
    new DeskModel({
      name: 'test',
    })
      .save()
      .then((savedDesk) => {
        deskID = savedDesk.id;
        done();
      });
  });
  describe('Set Average Time', () => {
    test('should add average time', (done) => {
      request(app)
        .post('/desk/stats/time')
        .send({
          time: 10,
          deskId: deskID,
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.error, res.body.message).toBeUndefined();
          expect(err).toBeNil();
          done();
        });
    });

    test('should not add zero or negative average time', (done) => {
      request(app)
        .post('/desk/stats/time')
        .send({
          time: 0,
          desk_id: deskID,
        })
        .expect(400)
        .end((err, res) => {
          expect(res.body.error, res.body.message).toBeTruthy();
          expect(err).toBeNil();
          done();
        });
    });
  });
  describe('Get Average Time', () => {
    beforeEach(async (done) => {
      await new AverageTimeModel({ time: 10, desk_id: deskID }).save();
      await new AverageTimeModel({ time: 20, desk_id: deskID }).save();
      await new AverageTimeModel({ time: 30, desk_id: deskID }).save();

      done();
    });
    test('should add latest average time', (done) => {
      request(app)
        .get('/desk/stats/time')
        .query({
          deskId: deskID,
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.error, res.body.message).toBeUndefined();
          expect(err).toBeNil();
          expect(res.body.time).toBe(30);
          expect(res.body.created_at).toBeTruthy();
          done();
        });
    });
  });
});
