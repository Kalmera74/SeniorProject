const config = require('config');
const path = require('path');

const knexConnector = require('knex')({
    client: 'pg',
    connection: {
        host : "127.0.0.1",
        user : "postgres",
        password : "159753",
        database : "api",
        charset: 'utf8'

    },
    useNullAsDefault: true,
    log: {
        warn(message) {
        },
    },
    migrations: {
        directory: path.join(__dirname, 'tables/'),
        tableName: 'migrations',
    },
    seeds: {
        directory: path.join(__dirname, 'seeds/'),
    },
});

module.exports = knexConnector;
