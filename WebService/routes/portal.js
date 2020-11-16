const api = require('express').Router();
import StatService from '../services/portal_service';
api.use(StatService);
export default api;
