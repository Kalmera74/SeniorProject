import express from "express";

// Utils
import { errorResp } from "../util/http_util";

const authorize = (req, res, next) => {
  const { utype } = req.userData;
  if (Number(utype) !== 3) {
    errorResp(res, new Error("Unauthorized Admin User"), 401);
    return;
  }
  next();
};

const router = express.Router();

router.use("/", authorize);

export default router;
