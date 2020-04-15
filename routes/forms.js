const express = require('express');
const router = express.Router({mergeParams:true});
const Form = require('../models/form');
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getFormsSearch, getFormsIndex, getFormEdit } = require('../controllers/forms');

//GET forms index
router.get('/', (req, res) => {res.redirect('/companies')});

//GET forms index for a particular company
router.get('/:companyId', asyncErrorHandler(getFormsIndex));

router.get('/edit/:id', asyncErrorHandler(getFormEdit));

module.exports = router;
