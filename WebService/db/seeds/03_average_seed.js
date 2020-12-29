import Model from '../../models/averageTime';
// Dummy average time data for test purpose.
exports.seed = (knex) =>
    knex(new Model().tableName)
        .del()
        .then(() => [
            {
                time: 121,
                desk_id: 1,
            },
            {
                time: 12,
                desk_id: 2,
            },
            {
                time: 45,
                desk_id: 3,
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
