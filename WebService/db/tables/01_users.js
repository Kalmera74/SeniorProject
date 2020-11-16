exports.up = (knex) => {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary;
        table.string('username').unique().notNullable();
        table.string('password').unique().notNullable();
        table.integer('priority_key').defaultTo(1).notNullable();
        table.boolean('is_deleted').defaultTo(false).notNullable();

        // created_at and updated_at
        table.timestamps();

        // Foreign Key
        table.foreign('priority_key');
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('users');
};
