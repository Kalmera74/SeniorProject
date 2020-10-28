const api = require("express").Router();

import AuthService from "../services/auth_service";

api.use("/auth", AuthService);

export default api;
