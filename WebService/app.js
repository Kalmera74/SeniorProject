import server from './server';
import {program} from 'commander';

//program details
program
    .option('-m, --migrate', 'migrate database')
    .option('-s, --seed', 'insert seed data into database')
    .option('-p, --port <port>', 'api port (default: 5000)')
    .option('-e, --env <env>', 'environment for database (dev, test)');

program.parse(process.argv);


//System working environment
process.env.NODE_ENV = program.env || 'dev';

console.info(`SET ENV : ${process.env.NODE_ENV}`);
if (program.port) {
    console.info(`SET PORT : ${program.port}`);
}
// creation table
if (program.migrate) {
    const db = require('./db/');
    db.migrate.rollback().then(() => {
        db.migrate.latest().then(() => {
            console.info('Migration Completed');
            if (program.seed) {
                db.seed
                    .run()
                    .then(() => {
                        console.info('Seed Completed');
                    })
                    .catch(console.error);
            }
        });
    });
} else {
    server.connect(program.port);
}
