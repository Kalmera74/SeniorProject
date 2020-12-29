import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const Queue = bookshelf.model('Queue', {
    tableName: 'queue',
});

export default Queue;
