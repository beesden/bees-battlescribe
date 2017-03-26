const fs = require('fs');
const parser = require('xml2js').Parser();
const cache = {};
const data = {};

data.getCatalogue = function (path) {
    if (cache[path]) {
        return cache[path];
    }

    try {
        let fileData = fs.readFileSync(path, 'ascii');

        parser.parseString(fileData.substring(0, fileData.length), (err, result) => {
            cache[path] = result;
        });

        return cache[path];
    } catch (ex) {
        console.log(ex)
    }
};

data.config = data.getCatalogue('data/wh40k/Warhammer40k.gst');

data.getFile = function (category, id) {
    let catalogue = data.getCatalogue(`data/${category}/${id}.cat`).catalogue;
    let profiles = [];

    try {
        catalogue.sharedProfiles.forEach((sharedProfile) => {
            sharedProfile.profile.forEach(profile => {
                profiles.push(profile);
            })
        });

        catalogue.sharedSelectionEntries.forEach((sharedSelectionEntry) => {
            sharedSelectionEntry.selectionEntry.forEach(entry => {
                profiles = iterate(entry, profiles)
            })
        });

        catalogue.sharedSelectionEntryGroups.forEach((sharedSelectionEntry) => {
            sharedSelectionEntry.selectionEntryGroup.forEach(entryGroup => {
                profiles = iterate(entryGroup, profiles)
            })
        });

        iterate(catalogue, profiles);
    } catch (e) {
        console.log('error', e)
    }

    profiles = profiles.sort((a, b) => a.$.name > b.$.name ? 1 : a.$.name < b.$.name ? -1 : 0);

    return profiles;
};

const iterate = function (data, profiles) {

    let lookups = {
        selectionEntries: 'selectionEntry',
        selectionEntryGroups: 'selectionEntryGroup',
        rules: 'rule',
        infoLinks: 'infoLink'
    };

    Object.entries(lookups).forEach((key, value) => {
        if (data[key]) {
            data[key].forEach((entry) => {
                if (entry && entry[value]) {
                    profiles = iterate(entry[value], profiles)
                }
            });
        }
    });

    if (data.profiles) {
        data.profiles.forEach(profile => {
            if (profile.profile) {
                profile.profile.forEach(profile => {
                    profiles = iterate(profile, profiles)
                    profiles.push(profile)
                })
            }
        })
    }

    return profiles;
};


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

module.exports = data;