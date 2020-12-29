const api = require('express').Router();
//Portal route
import StatService from '../services/portal_service';

api.use(StatService);
export default api;
