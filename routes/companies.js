const express = require('express');
const router = express.Router();
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getCompaniesIndex, getCompanyEdit, getFormsIndex, postNewCompany, getCompanyProfile } = require('../controllers/companies');

//GET Companies index
router.get('/', asyncErrorHandler(getCompaniesIndex));

//GET Company Profile
router.get('/:companyId', asyncErrorHandler(getCompanyProfile));

//POST new company
router.post('/', asyncErrorHandler(postNewCompany))

//GET forms index for a particular company
router.get('/:companyId/forms', asyncErrorHandler(getFormsIndex));

router.get('/edit/:companyId', asyncErrorHandler(getCompanyEdit));

module.exports = router;
