import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const Desk = bookshelf.model('Desk', {
    tableName: 'desks',
});

export default Desk;
