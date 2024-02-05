var express = require('express');
var router = express.Router();
var authRoutes = require('./auth.js');
var userRoutes= require('./user.js');

router.use('/', authRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;