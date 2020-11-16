const api = require('express').Router();

import DeskService from '../services/desk_service';
import UserService from '../services/user_service';
import sendEmail from '../services/email_service';

api.use(UserService);
api.use(DeskService);
api.post('/sendEmail', sendEmail);
export default api;
