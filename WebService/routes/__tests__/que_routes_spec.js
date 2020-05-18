
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const server = require("../index");


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(server);

describe('queue routes', () => {

    test("/queue post", async () => {
        const res = await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        expect(res.body.error).toBeUndefined()
        expect(res.statusCode).toEqual(201)
        expect(res.body.data).toHaveProperty('name')
        expect(res.body.data).toHaveProperty('surname')
        expect(res.body.data).toHaveProperty('code')
        expect(res.body.data).toHaveProperty('created_at')
    });

    test("/queue/:code get", async () => {
        const returnedData = await request(app)
                                .post('/queue')
                                .send({
                                    name : "name",
                                    surname : "surname",
                                });

        const res = await request(app)
            .get('/queue/'+ returnedData.body.data.code);

        expect(res.body.error).toBeUndefined()
        expect(res.statusCode).toEqual(200)
        expect(res.body.data).toHaveProperty('name');
        expect(res.body.data).toHaveProperty('surname');
        expect(res.body.data).toHaveProperty('code');
        expect(res.body.data).toHaveProperty('frontQueue');
        expect(res.body.data).toHaveProperty('waitingTime');
    });

    test("/queue/stats/time post", async () => {
        const res = await request(app)
            .post('/queue/stats/time')
            .send({
                time : 10,
            });

        expect(res.body.error).toBeUndefined()
        expect(res.statusCode).toEqual(201)
    });

    test("/queue/stats/time get", async () => {
        await request(app)
            .post('/queue/stats/time')
            .send({
                time : 5,
            });
        await request(app)
            .post('/queue/stats/time')
            .send({
                time : 8,
            });

        const res = await request(app)
            .get('/queue/stats/time');

        expect(res.body.error).toBeUndefined();
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(8);

    });

    test("/queue/stats/length get", async () => {
        await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        const res = await request(app)
            .get('/queue/stats/length');

        expect(res.body.error).toBeUndefined();
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(3);

    });

    test("/queue/stats/length/:code get", async () => {
        await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        const returnedData = await request(app)
            .post('/queue')
            .send({
                name : "name",
                surname : "surname",
            });

        const res = await request(app)
            .get('/queue/stats/length/'+ returnedData.body.data.code);

        expect(res.body.error).toBeUndefined();
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(2);

    });


})
