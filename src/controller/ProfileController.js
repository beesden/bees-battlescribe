const data = require('../data');

module.exports = function (request, response) {
    let armyId = data.getArmyId(request.params.armyId);

    response.render('codex_summary', {
        config: data.config,
        profiles: data.getProfiles(request.params.category, armyId),
        title: armyId
    });
};