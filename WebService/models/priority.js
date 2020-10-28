import db from "../db";

const bookshelf = require("bookshelf")(db);

const Priority = bookshelf.model("Priority", {
  tableName: "priority",
});

export default Priority;
