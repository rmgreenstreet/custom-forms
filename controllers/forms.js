const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Company = require('../models/company');
const mongoose = require('mongoose');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
const inputTypes = require('../models/inputTypes');

module.exports = {
  async getFormsIndex(req,res,next) {
    let location;
    try {
      console.log('getting location');
      location = await Location.findById(req.user.location);
    } catch (err) {
      console.log(err);
      req.session.error = 'Unable to load location data';
      return res.redirect('back')
    }
    let allForms = [];
    try {
      console.log('getting forms');
      for (let form of location.forms) {
        allForms.push(await Form.findById(form).populate({
          path:'lastEdited.by',
          ref: 'User'
        }));
      }
    } catch (err) {
      console.log(err);
      req.session.error = 'Unable to load forms';
      return res.redirect('back');
    }
    // console.log(location);
    // console.log(allForms);
    res.render('../views/admin/forms/index.ejs',{location,allForms});
  },
  async getFormCreate(req,res,next) {

  },
  async getFormEdit(req, res, next) {
    const currentForm = await Form.findById(req.params.id).populate({
      path: 'questions',
      model:'Question'
    });
    console.log(inputTypes)
    res.render('../views/admin/forms/edit.ejs', {currentForm,inputTypes});
  },
  async deleteForm(req,res,next) {
    let currentLocation;
    try {
      //Remove the reference to the Form from the 'forms' array in the parent 'Location'
      try {
        currentLocation = await Location.findOneAndUpdate(
          {
            forms: mongoose.Types.ObjectId(req.params.formId)
          }, 
          {
            $pull: {forms: req.params.formId}
          }
        );
      } catch (err) {
        console.error(err)
        throw new Error('Error removing Form from Location')
      }
      
      //Actually find and remove the 'Form' itself
      try {
        await Form.findByIdAndRemove(req.params.formId);
      } catch (err) {
        console.error(err);
        /* If the 'Form' can't be removed, re-add the reference to the form back into the 
         parent 'Location's 'forms' array*/
        await currentLocation.update({
          $push: {forms: mongoose.Types.ObjectId(req.params.formId)}
        })
        throw new Error('Error deleting Form')
      }
      
    } catch (err) {
      req.session.error = err;
    } finally {
      res.redirect(`/locations/${currentLocation._id}`);
    }
  }
};