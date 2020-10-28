import express from "express";
import jwt from "jsonwebtoken";

// Utils
import { errorResp, successResp } from "../util/http_util";

// Config
import config from "config";

const { auth } = config;

const authorize = (req, res, next) => {
  const { authentication, Authentication } = req.headers;

  const token = authentication || Authentication;
  console.log(token);

  if (!token) {
    errorResp(res, new Error("Unauthorized"), 401);
    return;
  }
  console.log(token);

  jwt.verify(token, auth.secret, function (err, decoded) {
    if (err || !decoded) {
      console.error(err);
      errorResp(res, new Error("Unauthorized"), 401);
      return;
    }
    req.userData = decoded;
    next();
  });
};

const router = express.Router();

router.use("/", authorize);

export default router;
