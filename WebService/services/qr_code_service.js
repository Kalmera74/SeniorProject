// Models
import QrCode from "../models/qrCode";

// Requirements
import express from "express";

// Utils
import { successResp, errorResp } from "../util/http_util";

const uuid = require("uuid");
const moment = require("moment");
const config = require("config");
const request = require("request");

let qnum = 0;

const generateQR = (req, res) => {
  const qrIns = {
    code: (qnum = qnum + 1),
    isActive: true,
    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  new QrCode(qrIns)
    .save()
    .then((savedQR) => {
      successResp(res, savedQR, 201);
    })
    .catch((err) => {
      errorResp(res, err);
    });
};

const useQR = (req, res) => {
  const { code } = req.params;

  QrCode.where({ code, isActive: true })
    .save(
      {
        isActive: false,
        used_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { method: "update" }
    )
    .then(() => {
      successResp(res, true);
    })
    .catch((err) => {
      errorResp(res, err);
    });
};

const router = express.Router();

router.route("/qr/").post(generateQR);
router.route("/qr/:code").put(useQR);

export default router;

