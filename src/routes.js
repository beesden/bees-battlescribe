const express = require('express');
const router = express.Router();
const {getArmyId, getCatalogue, config} = require('./data');

/* List of all army lists for a game */
router.get('/', function (request, response) {
    response.render('index', {
        categories: [],
        title: '40K References'
    });
});

// Army list views
router.get('/:gameId/:armyId/:view?', async (request, response) => {

    const armyId = getArmyId(request.params.armyId);

    const data = {};
    data.catalogue = await getCatalogue(request.params.gameId, armyId);
    data.game = await config();

    response.render('codex_entries', data);
});

module.exports = router;
