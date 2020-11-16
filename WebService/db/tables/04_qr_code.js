exports.up = (knex) => {
    return knex.schema.createTable('qr_code', (table) => {
        table.increments('id').primary;
        table.string('code').notNullable().unique;
        table.boolean('isActive').notNullable();
        table.dateTime('used_at');
        table.dateTime('created_at').notNullable();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('qr_code');
};
