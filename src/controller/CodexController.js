const data = require('../data');

module.exports = function (request, response) {
    let armyId = data.getArmyId(request.params.armyId);
    let categoryId = request.params.category;

    let profiles = {};
    data.getProfiles(categoryId, armyId).forEach(profile => profiles[profile.$.id] = profile);

    let entries = {};
    data.getEntries(categoryId, armyId).forEach(entry => entries[entry.$.id] = entry);

    response.render('codex', {
        config: data.config,
        catalogue: data.getCatalogue(`data/${categoryId}/${armyId}.cat`).catalogue.sharedSelectionEntries[0].selectionEntry,
        entries: entries,
        profiles: profiles,
        title: armyId
    });

};