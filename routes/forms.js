const express = require('express');
const router = express.Router();
const Form = require('../models/form');
const { asyncErrorHandler, isLoggedIn } = require('../middleware');
const { getFormsIndex, getFormEdit } = require('../controllers/forms');

//GET forms index
router.get('/', asyncErrorHandler(getFormsIndex));

router.get('/edit/:id', asyncErrorHandler(getFormEdit));

module.exports = router;
