const config = require("config");
const path = require('path')
const dbPath = path.resolve(__dirname, "../db/",config.database.filename);

const knexConnector = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: dbPath
    },
    useNullAsDefault: true
});

module.exports = knexConnector
