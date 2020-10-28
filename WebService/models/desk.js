import db from "../db";

const bookshelf = require("bookshelf")(db);

const Desk = bookshelf.model("Desk", {
  tableName: "desk",
});

export default Desk;
