import {registerHelper, registerPartials} from 'hbs';

registerHelper('id', (id) => new Buffer(id).toString('base64'));

registerHelper('json', context => JSON.stringify(context, null, 4));

registerHelper('get', (map, key) => map[key]);

registerHelper('filterProfiles', (model, type) => {
    return null;
});

registerHelper('if_eq', function (a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
});

registerHelper('if_ineq', function (a, b, opts) {
    return a !== b ? opts.fn(this) : opts.inverse(this);
});

registerPartials('views');