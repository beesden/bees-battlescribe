const hbs = require('hbs');
const fs = require('fs');

hbs.registerHelper('id', (id) => new Buffer(id).toString('base64'));
hbs.registerHelper('json', context => JSON.stringify(context, null, 4));
hbs.registerHelper('get', (map, key) => map[key]);
hbs.registerHelper('if_eq', function (a, b, opts) {
    return a === b ? opts.fn(this) : opts.inverse(this);
});
hbs.registerHelper('if_ineq', function (a, b, opts) {
    return a !== b ? opts.fn(this) : opts.inverse(this);
});

hbs.registerPartial('entries', fs.readFileSync('views/_entries.hbs', 'utf8'));
hbs.registerPartial('profile', fs.readFileSync('views/_profile.hbs', 'utf8'));
