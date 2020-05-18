const request = require('supertest')
const express = require('express')
const server = require("../index")


const app = express();
app.use(server);

describe('qr code routes', () => {

    test("/qr post", async () => {
        const res = await request(app)
                            .post('/qr');

        expect(res.statusCode).toEqual(201)
        expect(res.body.data).toHaveProperty('code')
        expect(res.body.data).toHaveProperty('created_at')
    });

    test("/qr put", async () => {
        const returnQR = await request(app)
            .post('/qr');

        const code = returnQR.body.data.code;

        const res = await request(app)
            .put('/qr/' + code);

        expect(res.body.error).toBeUndefined();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
    });

    test("/qr put error", async () => {

        const res = await request(app)
            .put('/qr');

        expect(res.statusCode).toEqual(404);
    });

})
