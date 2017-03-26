const express = require('express');
const router = express.Router();
const data = require('./data');
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {categories: data.categories, title: '40K References'});
});

/* GET references listing. */
router.get('/reference', function (req, res, next) {
    res.render('index', {categories: data.categories, title: '40K References'});
});

/* GET references listing. */
router.get('/reference/:category/:id', function (req, res, next) {
    let id = new Buffer(req.params.id, 'base64').toString('ascii');

    try {
        res.render('reference', {config: data.config, profiles: data.getFile(req.params.category, id), title: id});
    }
    catch (e) {
        res.render('index', {categories: data.categories, title: '40K References'});
    }
});

/* GET references listing. */
router.get('/catalogue/:category/:id', function (req, res, next) {
    let id = new Buffer(req.params.id, 'base64').toString('ascii');

    try {
        res.render('data', {data: data.getCatalogue(`data/${req.params.category}/${id}.cat`), title: id});
    }
    catch (e) {
        res.render('index', {categories: data.categories, title: '40K References'});
    }
});

module.exports = router;
