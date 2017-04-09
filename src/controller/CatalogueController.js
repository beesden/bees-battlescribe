const data = require('../data');

module.exports = function (request, response) {
    let armyId = data.getArmyId(request.params.armyId);

    response.render('data', {
        data: data.getCatalogue(`data/${request.params.category}/${armyId}.cat`),
        title: armyId
    });
};