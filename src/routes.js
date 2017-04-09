const express = require('express');
const router = express.Router();
const data = require('./data');
const fs = require('fs');

/* List of all army lists for a game */
router.get('/', function (request, response) {
    response.render('index', {
        categories: data.categories,
        title: '40K References'
    });
});

// Army list views
router.get('/:gameId/:armyId/:view?', function (request, response) {
    let armyId = data.getArmyId(request.params.armyId);

    response.render(`codex_${request.params.view || 'entries'}`, {
        catalogue: data.getCatalogue(request.params.gameId, armyId),
        config: data.config,
        params: request.params,
        title: armyId
    });
});

module.exports = router;
