import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const QrCode = bookshelf.model('QrCode', {
    tableName: 'qr_code',
});

export default QrCode;
