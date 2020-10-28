const api = require("express").Router();

import DeskService from "../services/desk_service";
import UserService from "../services/user_service";

api.use(UserService);
api.use(DeskService);

export default api;
