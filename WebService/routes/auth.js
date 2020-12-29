const api = require('express').Router();
//Authentication route
import AuthService from '../services/auth_service';

api.use('/auth', AuthService);

export default api;
