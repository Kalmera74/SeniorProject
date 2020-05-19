const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
var pjson = require('./package.json');
const qr_code_service = require('./services/qr_code_service')
// Documentation
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const api = require('./routes/index')


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

const apiPath = '/api/v'+pjson.version;
app.use(apiPath, api);


const connect = (port) =>{
    port = port || 5000;

    const swaggerOptions = {
        swaggerDefinition: {
            info: {
                title: "Queue System API",
                version: pjson.version,
                description: "A basic API for Queue system",
            },
            basePath: apiPath,
        },
        apis:  ['./routes/index.js'],
    };
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.listen(port, () => {
        qr_code_service.generateQR().then(qr_code_service.sendQR);
        console.info('Running on http://localhost:%s', port);
    });
}


module.exports.connect = connect;

