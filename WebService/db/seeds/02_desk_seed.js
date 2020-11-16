import Model from '../../models/desk';

exports.seed = (knex) =>
    knex(new Model().tableName)
        .del()
        .then(() => [
            {
                name: 'Test 1 Desk',
            },
            {
                name: 'Test 2 Desk',
            },
            {
                name: 'Test 3 Desk',
            },
        ])
        .then((newsModels) =>
            Promise.all(newsModels.map((model) => new Model(model).save())).then(
                () => {
                    console.info('OK');
                }
            )
        )
        .catch((err) => console.error(err));
