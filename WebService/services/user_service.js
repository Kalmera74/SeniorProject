import express from "express";

// Models
import UserModel from "../models/user";

// Utils
import { errorResp, successResp } from "../util/http_util";

// Endpoints
function removeUser(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    errorResp(res, new Error("id must be number"));
    return;
  }

  UserModel.where({ id, is_deleted: false })
    .save({ is_deleted: true }, { method: "update" })
    .then(() => {
      successResp(res, { id });
    })
    .catch((err) => {
      errorResp(res, err);
    });
}

function listUsers(req, res) {
  UserModel.where({ is_deleted: false })
    .fetchAll({
      columns: ["id", "username"],
      require: false,
    })
    .then((result) => {
      successResp(res, { data: result });
    })
    .catch((err) => {
      console.error(err);
      errorResp(res, new Error("error occurs when listing users"));
    });
}

const router = express.Router();

router.route("/user/:id").delete(removeUser);
router.route("/user").get(listUsers);

export default router;
