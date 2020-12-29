import db from '../db';
//Models that address tables in data base used by due to ORM
const bookshelf = require('bookshelf')(db);

const PortalVerificationString = bookshelf.model('PortalVerificationString', {
    tableName: 'portal_verification_string',
});

export default PortalVerificationString;
