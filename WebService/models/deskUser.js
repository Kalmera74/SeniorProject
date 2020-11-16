import db from '../db';

const bookshelf = require('bookshelf')(db);

const DeskUser = bookshelf.model('DeskUser', {
    tableName: 'desk_user',
});

export default DeskUser;
