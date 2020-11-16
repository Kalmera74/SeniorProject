exports.up = (knex) => {
    return knex.schema.createTable('desk_user', (table) => {
        table.increments('id'); // Queue Number

        table.integer('user_id').notNullable();
        table.integer('desk_id').notNullable();

        // Foreign Keys
        table.foreign('desk_id').references('desks.id', 'desk_id');
        table.foreign('user_id').references('users.id', 'user_id');

        table.boolean('is_active').defaultTo(true).notNullable();
        table.boolean('is_finished').defaultTo(false).notNullable();

        table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
        table.dateTime('finished_at');
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('desk_user');
};
