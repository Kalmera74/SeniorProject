import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const RefLink = bookshelf.model('RefLink', {
    tableName: 'ref_links',
});

export default RefLink;
