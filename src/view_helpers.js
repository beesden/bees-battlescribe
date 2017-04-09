const hbs = require('hbs');
const fs = require('fs');

hbs.registerHelper('id', (id) => new Buffer(id).toString('base64'));
hbs.registerHelper('json', context => JSON.stringify(context, null, 4));
hbs.registerHelper('get', (map, key) => map[key]);
hbs.registerHelper('filterProfiles', (model, type) => {
    return Object.values(model)
        .filter(a => a.$.profileTypeId === type)
        .sort((a, b) => a.$.name > b.$.name ? 1 : a.$.name < b.$.name ? -1 : 0)
});
hbs.registerHelper('if_eq', function (a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
});
hbs.registerHelper('if_ineq', function (a, b, opts) {
    return a !== b ? opts.fn(this) : opts.inverse(this);
});

hbs.registerPartials('views');