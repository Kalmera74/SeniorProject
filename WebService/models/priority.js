import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const Priority = bookshelf.model('Priority', {
    tableName: 'priority',
});

export default Priority;
