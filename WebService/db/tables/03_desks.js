exports.up = (knex) => {
    return knex.schema.createTable('desks', (table) => {
        table.increments('id').primary;
        table.string('name').notNullable();

        table.boolean('is_active').defaultTo(true).notNullable();
        table.boolean('is_deleted').defaultTo(false).notNullable();

        // created_at and updated_at
        table.timestamps();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('desks');
};
