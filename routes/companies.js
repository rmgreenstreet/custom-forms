const express = require('express');
const router = express.Router({mergeParams:true});
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getCompaniesIndex, getCompanyEdit, getFormsIndex, postNewCompany, getCompanyProfile, putCompanyEdit } = require('../controllers/companies');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

//GET Companies index
router.get('/', asyncErrorHandler(getCompaniesIndex));

//GET Company Profile
router.get('/:companyId', asyncErrorHandler(getCompanyProfile));

//POST new company
router.post('/', upload.single('image'), asyncErrorHandler(postNewCompany))

//GET forms index for a particular company
router.get('/:companyId/forms', asyncErrorHandler(getFormsIndex));

//PUT updates to company
router.put('/:companyId', upload.single('image'), asyncErrorHandler(putCompanyEdit));

module.exports = router;
