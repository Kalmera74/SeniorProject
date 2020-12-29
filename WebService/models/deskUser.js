import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const DeskUser = bookshelf.model('DeskUser', {
    tableName: 'desk_user',
});

export default DeskUser;
