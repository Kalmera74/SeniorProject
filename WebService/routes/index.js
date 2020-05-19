const api = require('express').Router();
const qr_code = require('./qr_code');
const que_code = require('./que');


/**
 * @swagger
 * /qr:
 *   post:
 *     description: Generate a new QR
 *     tags:
 *       - QR
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: QR
 *       schema:
 *         type: object
 *         required:
 *           - code
 *           - created_at
 *         properties:
 *            code:
 *              type: string
 *            created_at:
 *              type: datetime
 */
api.route("/qr")
    .post(qr_code.generateQR)

/**
 * @swagger
 * /qr/{code}:
 *   put:
 *     description: Use generated QR
 *     tags:
 *       - QR
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         in: path
 *         description: Code of QR
 *         required: true
 *         schema:
 *           type: string
 *           format: string
 *     responses:
 *       200:
 *         description: QR
 *       schema:
 *         type: object
 *         required:
 *           - message
 *         properties:
 *             message:
 *              type: string
 */
api.route("/qr/:code")
    .put(qr_code.useQR);

/**
 * @swagger
 * /queue:
 *   post:
 *     description: Add a customer into the queue with QR
 *     tags:
 *       - Queue
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         in: formData
 *         description: QR Code
 *         required: true
 *         schema:
 *           type: string
 *           format: string
 *     responses:
 *       200:
 *         description: queue
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - surname
 *             - code
 *             - waitingTime
 *             - frontQueue
 *         properties:
 *           name:
 *            type: string
 *           surname:
 *            type: string
 *           code:
 *            type: string
 *           waitingTime:
 *            type: integer
 *           frontQueue:
 *            type: integer
 */
api.route("/queue")
    .post(que_code.addQueue);

/**
 * @swagger
 * /queue/stats/time:
 *   get:
 *     description: Get current average time
 *     tags:
 *       - Queue
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: queue
 *         schema:
 *           type: object
 *           required:
 *             - time
 *             - created_at
 *         properties:
 *           time:
 *            type: integer
 *           created_at:
 *            type: datetime
 *   post:
 *     description: Set average time
 *     tags:
 *       - Queue
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: time
 *         in: formData
 *         description: Average time for queue waiting time calculation
 *         required: true
 *         schema:
 *           type: integer
 *           format: integer
 *     responses:
 *       200:
 *         description: queue
 *         schema:
 *           type: object
 *           required:
 *             - time
 *             - created_at
 *         properties:
 *           time:
 *            type: integer
 *           created_at:
 *            type: datetime
 */
api.route("/queue/stats/time")
    .get(que_code.getAverageTime)
    .post(que_code.setAverageTime);

/**
 * @swagger
 * /queue/stats/length:
 *   get:
 *     description: Get length of current queue
 *     tags:
 *       - Queue
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: queue
 *         schema:
 *           type: object
 *           required:
 *             - total
 *         properties:
 *           total:
 *            type: integer
 */
api.route("/queue/stats/length")
    .get(que_code.getQueueLength);

/**
 * @swagger
 * /queue/stats/length/{code}:
 *   get:
 *     description: Get length of current queue
 *     tags:
 *       - Queue
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: code
 *         in: path
 *         description: Code of QR
 *         required: true
 *         schema:
 *           type: string
 *           format: string
 *     responses:
 *       200:
 *         description: queue
 *         schema:
 *           type: object
 *           required:
 *             - total
 *         properties:
 *           total:
 *            type: integer
 */
api.route("/queue/stats/length/:code")
    .get(que_code.frontQueueLength);

module.exports = api;
