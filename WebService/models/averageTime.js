import db from "../db";

const bookshelf = require("bookshelf")(db);

const AverageTime = bookshelf.model("AverageTime", {
  tableName: "average_time",
});

export default AverageTime;
