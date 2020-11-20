import db from '../db';

const bookshelf = require('bookshelf')(db);

const PortalVerificationString = bookshelf.model('PortalVerificationString', {
    tableName: 'portal_verification_string',
});

export default PortalVerificationString;
