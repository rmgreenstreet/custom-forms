const express = require('express');
const router = express.Router();
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getCompaniesIndex, getCompanyEdit, getFormsIndex, postNewCompany } = require('../controllers/companies');

//GET Companies index
router.get('/', asyncErrorHandler(getCompaniesIndex));

//POST new company
router.post('/', asyncErrorHandler(postNewCompany))

//GET forms index for a particular company
router.get('/:companyId/forms', asyncErrorHandler(getFormsIndex));

router.get('/edit/:id', asyncErrorHandler(getCompanyEdit));

module.exports = router;
