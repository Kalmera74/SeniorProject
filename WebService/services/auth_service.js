import express from "express";
import jwt from "jsonwebtoken";

// Models
import UserModel from "../models/user";
import PriorityModel from "../models/priority";

// Utils
import { successResp, errorResp } from "../util/http_util";

// Config
import config from "config";

const { auth } = config;

const register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    errorResp(res, new Error("Username and Password are required"));
    return;
  }

  UserModel.where({
    username,
  })
    .fetch({ columns: ["id"], require: false })
    .then((result) => {
      if (result) {
        errorResp(res, new Error("Username Already Used"));
      } else {
        new UserModel({
          username,
          password,
          priority_key: 2,
        })
          .save()
          .then((savedUser) => {
            successResp(res, { username: savedUser.get("username") });
          })
          .catch((err) => {
            errorResp(res, err);
          });
      }
    });
};

const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    errorResp(res, new Error("Username and Password are required"));
    return;
  }

  UserModel.where({ username })
    .fetch()
    .then((user) => {
      UserModel.verify(password, user.get("password")).then((isMatch) => {
        if (isMatch) {
          const token = jwt.sign(
            {
              uid: user.get("id"),
              utype: user.get("priority_key"),
              uname: user.get("username"),
            },
            auth.secret,
            { expiresIn: auth.expiredTime }
          );
          successResp(res, {
            token,
            username: user.get("username"),
            priority: user.get("priority_key"),
          });
        } else {
          errorResp(res, new Error("Wrong Password"));
        }
      });
    })
    .catch((err) => {
      errorResp(res, new Error("Non-exists Username"));
    });
};

const router = express.Router();

router.route("/login").post(login);

router.route("/register").post(register);

export default router;
