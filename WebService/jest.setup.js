import db from "./db";

const knexjscleaner = require("knex-cleaner");

const knesjsCleanerOpts = {
  mode: "truncate", // Valid options 'truncate', 'delete'
  restartIdentity: true, // Used to tell PostgresSQL to reset the ID counter
  ignoreTables: ["migrations", "migrations_lock"],
};

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

beforeEach(async (done) => {
  await knexjscleaner.clean(db, knesjsCleanerOpts);
  done();
});

afterAll(async (done) => {
  await db.migrate
    .rollback()
    .then(() => db.destroy())
    .catch(done);

  done();
});
