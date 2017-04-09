const express = require('express');
const router = express.Router();
const data = require('./data');
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {categories: data.categories, title: '40K References'});
});

/* GET listings page */
router.get('/reference', function (req, res, next) {
    res.render('index', {categories: data.categories, title: '40K References'});
});

/* GET codex view */
router.get('/:category/:id', function (req, res, next) {
    let id = new Buffer(req.params.id, 'base64').toString('ascii');

    try {
        let profiles = {};
        data.getProfiles(req.params.category, id).forEach(profile => profiles[profile.$.id] = profile);

        let entries = {};
        data.getEntries(req.params.category, id).forEach(entry => entries[entry.$.id] = entry);

        res.render('codex', {
            config: data.config,
            catalogue: data.getCatalogue(`data/${req.params.category}/${id}.cat`).catalogue.sharedSelectionEntries[0].selectionEntry,
            entries: entries,
            profiles: profiles,
            title: id
        });
    }
    catch (e) {
        res.render('error', {error: e, title: 'Error'});
    }
});

/* GET summary profiles */
router.get('/:category/:id/summary', function (req, res, next) {
    let id = new Buffer(req.params.id, 'base64').toString('ascii');

    try {
        res.render('codex_summary', {
            config: data.config,
            profiles: data.getProfiles(req.params.category, id),
            title: id
        });
    }
    catch (e) {
        res.render('error', {error: e, title: 'Error'});
    }
});

/* GET raw data */
router.get('/catalogue/:category/:id', function (req, res, next) {
    let id = new Buffer(req.params.id, 'base64').toString('ascii');

    try {
        res.render('data', {data: data.getCatalogue(`data/${req.params.category}/${id}.cat`), title: id});
    }
    catch (e) {
        res.render('error', {error: e, title: 'Error'});
    }
});

module.exports = router;
