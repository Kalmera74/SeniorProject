const server = require("./server")
const { program } = require('commander');


program
    .option('-m, --migrate', 'migrate database')
    .option('-p, --port <port>', 'api port (default: 5000)')
    .option('-e, --env <env>', 'environment for database (dev, test)');

program.parse(process.argv);

process.env.NODE_ENV = program.env || 'dev';

console.info(`SET ENV : ${process.env.NODE_ENV}`);
if(program.port){
    console.info(`SET PORT : ${program.port}`);
}

if(program.migrate) {
    const tables = require('./db/tables')
    tables.migrate();
}else{
    server.connect(program.port)
}
