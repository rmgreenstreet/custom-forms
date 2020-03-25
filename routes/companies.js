const express = require('express');
const router = express.Router();
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getCompaniesIndex, getCompanyEdit, getFormsIndex } = require('../controllers/companies');

//GET Companies index
router.get('/', asyncErrorHandler(getCompaniesIndex));

//GET forms index for a particular company
router.get('/:companyId/forms', asyncErrorHandler(getFormsIndex));

router.get('/edit/:id', asyncErrorHandler(getFormEdit));

module.exports = router;
