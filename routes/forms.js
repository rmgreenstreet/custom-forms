const express = require('express');
const router = express.Router({mergeParams:true});
const Form = require('../models/form');
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getFormsSearch, getFormsIndex, getFormEdit, deleteForm } = require('../controllers/forms');

//GET forms index
router.get('/', (req, res) => {res.redirect('/companies')});

//GET form edit page
router.get('/:formId/edit/', asyncErrorHandler(getFormEdit));

//DELETE a form
router.delete('/:formId', asyncErrorHandler(deleteForm))

module.exports = router;
