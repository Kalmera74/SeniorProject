import bcrypt from 'bcrypt';
import db from '../db';

const SALT_ROUNDS = 7;

// Hash the string and check the value whether it matches or not.

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

const checkAndHash = (user) => {
    if (!user.password) return Promise.resolve(user);


    // Hash the message.
    return hashPassword(user.password)
        .then((hash) => {
            user.password = hash;
        })
        .catch((err) => `Error Hashing: ${err}`);
};

const bookshelf = require('bookshelf')(db);


//Models that address tables in data base used by due to ORM.
const User = bookshelf.model(
    'User',
    {
        initialize() {
            this.constructor.__super__.initialize.apply(this, arguments);

            this.on('creating', this.validateSave);
            this.on('updating', this.validateUpdate);
        },
        tableName: 'users',
        validateUpdate(model, attrs) {
            if (model.password !== attrs) return checkAndHash(this.attributes);
            return this.attributes;
        },
        validateSave() {
            return checkAndHash(this.attributes);
        },
    },
    {
        verify(password, data) {
            return verifyPassword(password, data);
        },
    }
);

export default User;
