exports.up = (knex) => {
    return knex.schema.createTable('average_time', (table) => {
        table.increments('id').primary;
        table.integer('time').notNullable();
        table.integer('desk_id').notNullable();

        // Foreign Keys
        table.foreign('desk_id').references('desk');

        table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('average_time');
};
