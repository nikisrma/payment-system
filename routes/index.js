var express = require('express');
var router = express.Router();
var viewRoutes = require('./views/main.js');
var apiRoutes= require('./apis/main.js');


router.use('/', viewRoutes);
router.use('/api', apiRoutes);

module.exports = router;