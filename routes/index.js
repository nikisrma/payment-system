var express = require('express');
var router = express.Router();
var viewRoutes = require('./views/main.js');
var apiRoutes= require('./apis/main.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/', viewRoutes);
router.use('/api', apiRoutes);

module.exports = router;