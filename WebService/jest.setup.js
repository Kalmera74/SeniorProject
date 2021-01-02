import db from "./db";

const knexjscleaner = require("knex-cleaner");


// Reset test tables in every run.


const knesjsCleanerOpts = {
  mode: "truncate", // Valid options 'truncate', 'delete'
  restartIdentity: true, // Used to tell PostgresSQL to reset the ID counter
  ignoreTables: ["migrations", "migrations_lock"],
};

// Migrate table.
beforeAll(async (done) => {
  await db.migrate
    .latest()
    .then(() => {
      done();
    })
    .catch((reason) => {
      done(reason);
    });
});

//Clear data in each test case.
beforeEach(async (done) => {
  await knexjscleaner.clean(db, knesjsCleanerOpts);
  done();
});

//Store the data.

afterAll(async (done) => {
  await db.migrate
    .rollback()
    .then(() => db.destroy())
    .catch(done);

  done();
});
