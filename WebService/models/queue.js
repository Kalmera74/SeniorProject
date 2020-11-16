import db from '../db';

const bookshelf = require('bookshelf')(db);

const Queue = bookshelf.model('Queue', {
    tableName: 'queue',
});

export default Queue;
