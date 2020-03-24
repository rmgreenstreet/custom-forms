const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
const { routeByRole } = require('../controllers/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/dashboard');
});

// isLoggedIn, asyncErrorHandler(routeByRole)
//GET dashboard
router.get('/dashboard', asyncErrorHandler(routeByRole));

module.exports = router;
