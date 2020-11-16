exports.up = (knex) => {
    return knex.schema.createTable('ref_links', (table) => {
        table.increments('id'); // Queue Number


        table.string('ref_code').unique().notNullable();
        table.boolean('is_active').defaultTo(true).notNullable();

        table.timestamp('created_at',{ useTz: false }).defaultTo(knex.fn.now()).notNullable();
        table.timestamp('expires_at',{ useTz: false });
    });
};

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('ref_links');
};
