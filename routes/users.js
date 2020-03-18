var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//GET dashboard
router.get('/dashboard', function(req, res, next) {
  console.log('getting dashboard');
  res.render('../views/owner/dashboard');
});

module.exports = router;
