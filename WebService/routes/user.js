const api = require("express").Router();

import QueueService from "../services/queue_service";
import QRService from "../services/qr_code_service";

api.use(QueueService);
api.use(QRService);

export default api;
