import db from "../db";

const bookshelf = require("bookshelf")(db);

const QrCode = bookshelf.model("QrCode", {
  tableName: "qr_code",
});

export default QrCode;
