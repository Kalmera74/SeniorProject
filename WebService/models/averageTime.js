import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const AverageTime = bookshelf.model('AverageTime', {
    tableName: 'average_time',
});

export default AverageTime;
