var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('pages/auth/login');
});

router.get('/forget-password', function(req, res, next) {
  res.render('pages/auth/forgetPassword');
});

router.get('/otp-verification', function(req, res, next) {
  res.render('pages/auth/otpVerification');
});

router.get('/reset-password', function(req, res, next) {
  res.render('pages/auth/resetPassword');
});


module.exports = router;