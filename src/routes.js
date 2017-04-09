const express = require('express');
const router = express.Router();
const data = require('./data');
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {categories: data.categories, title: '40K References'});
});

router.get('/:category/:armyId', require('./controller/CodexController'));
router.get('/:category/:armyId/summary', require('./controller/ProfileController'));
router.get('/:category/:armyId/catalogue', require('./controller/CatalogueController'));

module.exports = router;
