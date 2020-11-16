import db from '../db';

const bookshelf = require('bookshelf')(db);

const RefLink = bookshelf.model('RefLink', {
    tableName: 'ref_links',
});

export default RefLink;
