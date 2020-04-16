const express = require('express');
const router = express.Router({mergeParams:true});
const { asyncErrorHandler, isLoggedIn, isAdmin, isOwner } = require('../middleware');
const { getLocationsIndex, getLocationEdit, postNewLocation, getLocationProfile, putLocationEdit } = require('../controllers/locations');
const { getFormsIndex } = require('../controllers/forms')

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

//GET Locations index
router.get('/', asyncErrorHandler(getLocationsIndex));

//GET Location Profile
router.get('/:locationId', asyncErrorHandler(getLocationProfile));

//POST new Location
router.post('/', upload.single('image'), asyncErrorHandler(postNewLocation))

//GET forms index for a particular Location
router.get('/:locationId/forms', asyncErrorHandler(getFormsIndex));

//PUT updates to Location
router.put('/:locationId', upload.single('image'), asyncErrorHandler(putLocationEdit));

module.exports = router;
