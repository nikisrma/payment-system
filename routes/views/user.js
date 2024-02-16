var express = require('express');
var router = express.Router();
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('pages/dashboard');
});
router.get('/dashboard', function(req, res, next) {
    res.render('pages/dashboard');
});

router.get('/list', function(req, res, next) {
  res.render('pages/user/list');
});

router.get('/blogs', function(req, res, next) {
  res.render('pages/blogs/list');
});

router.get('/detail', function(req, res, next) {
  res.render('pages/blogs/detail');
});

module.exports = router;