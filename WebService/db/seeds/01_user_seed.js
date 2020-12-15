import UserModel from '../../models/user';

exports.seed = (knex) =>
    knex(new UserModel().tableName)
        .del()
        .then(() => [
            {
                username: 'admin',
                password: 'admin',
                priority_key: 3,
            },
            {
                nationID: 12345678999,
                password: '123456',
                priority_key: 0,
            },
            {
                username: 'portaluser',
                password: '5555',
                priority_key: 10,
            },
        ])
        .then((newUsers) =>
            Promise.all(newUsers.map((user) => new UserModel(user).save())).then(
                () => {
                    console.info('OK');
                }
            )
        )
        .catch((err) => console.error(err));
