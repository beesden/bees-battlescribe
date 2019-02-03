const fs = require('fs');
const parser = require('xml2js').Parser();
const data = {};
const {Catalogue} = require('./model/model');

const getFile = function (path) {

    return new Promise((resolve, reject) => {

        const fileData = fs.readFileSync(path, 'ascii').replace(/<(\w+) ?\/>/g, '');

        parser.parseString(fileData, (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });


    });
};

class Service {

    static config() {
        return getFile('data/wh40k/Warhammer 40,000 8th Edition.gst');
    };

    static getArmyId(id) {
        return new Buffer(id, 'base64').toString('ascii');
    };

    static getCatalogue(category, id) {
        return getFile(`data/${category}/${id}.cat`).then(({catalogue}) => new Catalogue(catalogue));
    }
}


fs.readdir('data', (err, folders) => {
    data.categories = {};

    folders.forEach(folder => {
        data.categories[folder] = {category: folder, rules: []};

        fs.readdir('data/' + folder, (err, files) => files.forEach(file => {
            if (file.endsWith('.cat')) {
                data.categories[folder].rules.push(file.substring(0, file.length - 4));
            }
        }))
    })
});

module.exports = Service;