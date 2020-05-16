const db = require("./db");

const up = async () => {
    await db.schema.createTable("queue", (table)=>{
        table.increments("id").primary; // int - bigint
        table.string("name").notNullable();
        table.string("surname").notNullable();
        table.string("code").notNullable(); //nvarchar
        table.boolean("isInQueue").notNullable(); //bit 
        table.dateTime("created_at").notNullable();
    }).then()
        .catch(console.error);

    await db.schema.createTable("qr_code", (table)=>{
        table.increments("id").primary;
        table.string("code").notNullable().unique;
        table.boolean("isActive").notNullable();
        table.dateTime("used_at");
        table.dateTime("created_at").notNullable();
    }).then()
        .catch(console.error);

    await db.schema.createTable("average_time", (table)=>{
        table.increments("id").primary;
        table.integer("time").notNullable();
        table.dateTime("created_at").notNullable();
    }).then()
        .catch(console.error);


    if(process.env.NODE_ENV !== 'test'){
        console.info("Tables MIGRATED");
    }
}

const down = async  () => {
    await  db.schema.dropTableIfExists("queue").then().catch(console.error);
    await  db.schema.dropTableIfExists("qr_code").then().catch(console.error);
    await  db.schema.dropTableIfExists("average_time").then().catch(console.error);

    if(process.env.NODE_ENV !== 'test') {
        console.info("Tables DROPPED");
    }
}



const migrate = async () => {
    await down();
    await up();
}


module.exports.migrate = migrate;
