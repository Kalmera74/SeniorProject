exports.up = (knex) => {
    return knex.schema.createTable('priority', (table) => {
        table.increments('id').primary;
        table.string('type').notNullable();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('priority');
};
