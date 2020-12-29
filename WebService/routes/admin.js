const api = require('express').Router();
//Admin route
import DeskService from '../services/desk_service';
import UserService from '../services/user_service';
import sendEmail from '../services/email_service';
import genratePortalRegistrationLink from '../services/verification_token_genrate_service'

api.use(UserService);
api.use(DeskService);
api.post('/sendEmail', sendEmail);
api.get('/genratePortalRegistrationLink',genratePortalRegistrationLink)


export default api;
