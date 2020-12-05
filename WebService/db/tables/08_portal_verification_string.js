exports.up = (knex) => {
    return knex.schema.createTable('portal_verification_string', (table) => {
        table.increments('id').primary;
        table.string('token').unique().notNullable();

        // created_at and updated_at
        table.timestamps();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('portal_verification_string');
};
