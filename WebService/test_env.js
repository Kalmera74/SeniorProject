const tables = require('./db/tables')


beforeEach(async (done)=>{
    await tables.migrate();
    done();
})
