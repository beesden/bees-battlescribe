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

data.getEntries = function (category, id) {
    let catalogue = data.getCatalogue(`data/${category}/${id}.cat`).catalogue;
    let entries = [];

    try {
        catalogue.sharedSelectionEntries.forEach((sharedSelectionEntry) => {
            sharedSelectionEntry.selectionEntry.forEach(entry => {
                entries = indexEntries(entry, entries)
            })
        });

        catalogue.sharedSelectionEntryGroups.forEach((sharedSelectionEntry) => {
            sharedSelectionEntry.selectionEntryGroup.forEach(entryGroup => {
                entries = indexEntries(entryGroup, entries)
            })
        });

        entries = indexEntries(catalogue, entries);
    } catch (e) {
        console.log('error', e)
    }

    return entries;
};

const indexEntries = function (data, entries) {

    let lookups = {
        selectionEntryGroups: 'selectionEntryGroup',
        rules: 'rule',
        infoLinks: 'infoLink'
    };

    Object.entries(lookups).forEach((key, value) => {
        if (data[key]) {
            data[key].forEach((entry) => {
                if (entry && entry[value]) {
                    entries = indexEntries(entry[value], entries)
                }
            });
        }
    });

    if (data.selectionEntries) {
        data.selectionEntries.forEach(entry => {
            if (entry.selectionEntry) {
                entry.selectionEntry.forEach(selectionEntry => {
                    entries = indexEntries(selectionEntry, entries)
                    entries.push(selectionEntry)
                })
            }
        })
    }

    return entries;
};

data.getProfiles = function (category, id) {
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
                profiles = indexProfiles(entry, profiles)
            })
        });

        catalogue.sharedSelectionEntryGroups.forEach((sharedSelectionEntry) => {
            sharedSelectionEntry.selectionEntryGroup.forEach(entryGroup => {
                profiles = indexProfiles(entryGroup, profiles)
            })
        });

        indexProfiles(catalogue, profiles);
    } catch (e) {
        console.log('error', e)
    }

    profiles = profiles.sort((a, b) => a.$.name > b.$.name ? 1 : a.$.name < b.$.name ? -1 : 0);

    return profiles;
};

const indexProfiles = function (data, profiles) {

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
                    profiles = indexProfiles(entry[value], profiles)
                }
            });
        }
    });

    if (data.profiles) {
        data.profiles.forEach(profile => {
            if (profile.profile) {
                profile.profile.forEach(profile => {
                    profiles = indexProfiles(profile, profiles)
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