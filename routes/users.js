const express = require('express');
const router = express.Router({mergeParams:true});
const User = require('../models/user');
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
const { routeByRole, sendInvitation } = require('../controllers/users');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/dashboard');
});

// isLoggedIn, asyncErrorHandler(routeByRole)
//GET dashboard
router.get('/dashboard', asyncErrorHandler(routeByRole));

router.post('/dashboard', asyncErrorHandler(routeByRole));

//POST send
router.post('/send', asyncErrorHandler(sendInvitation));

module.exports = router;
