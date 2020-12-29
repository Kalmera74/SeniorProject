const api = require('express').Router();
// Users route
import QueueService from '../services/queue_service';
import QRService from '../services/qr_code_service';
import InfoService from '../services/user_info_service';

api.use(QueueService);
api.use(QRService);
api.use(InfoService);

export default api;
