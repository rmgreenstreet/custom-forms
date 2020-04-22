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
  async postFormCreate(req,res,next) {
    try {
      let currentLocation;
      let newForm;
      try {
        currentLocation = await Location.findById(req.body.locationId);
      } catch (err) {
        console.error(err);
        throw new Error('Error looking up location');
      }

      try {
        newForm = await Form.create({title: req.body.form.title, 'lastEdited.by': req.user._id});
        await newForm.addDefault();
      } catch (err) {
        console.error(err);
        throw new Error('Error creating new form');
      }

      try {
        currentLocation.forms.push(newForm._id);
        await currentLocation.save();
      } catch (err) {
        console.error(err);
        await newForm.remove();
        throw new Error('Error adding form to location');
      }
      res.redirect(`/forms/${newForm._id}/edit`)

    } catch (err) {
      req.session.error = err;
      res.redirect(`/locations/${req.params.locationId}`)
    } 
  },
  async getFormEdit(req, res, next) {
    let currentForm;
    try {
      try {
        currentForm = await Form.findById(req.params.formId).populate({
          path: 'sections.questions',
          model:'Question'
        });
      } catch (err) {
        console.error(err);
        throw new Error('Error getting form');
      }

      try {
        res.render('../views/form/edit.ejs', {currentForm,inputTypes});
      } catch (err) {
        console.error(err);
        throw new Error('Error loading form edit page');
      }
    } catch (err) {
      req.session.error = err;
      res.redirect(`/users/dashboard`);
    }
    
  },
  async deleteForm(req,res,next) {
    let currentLocation;
    try {
      //Remove the reference to the Form from the 'forms' array in the parent 'Location'
      try {
        currentLocation = await Location.findOne(
          {
            forms: mongoose.Types.ObjectId(req.params.formId)
          }
        );
      } catch (err) {
        console.error(err)
        throw new Error('Error removing Form from Location')
      } 
      
      //Find the parent location, to be updated after deleting the form
      try {
        new Promise(async (resolve, reject) => {
          try {
            await Form.findByIdAndRemove(req.params.formId);
            resolve();
          } catch (err) {
            reject(err);
          }
        })
        /* only after the form is deleted, remove the reference from the parent Location */
        .then(async () => {
          await currentLocation.update({
            $pull: {forms: mongoose.Types.ObjectId(req.params.formId)}
          });
        });
      } catch (err) {
        console.error(err);        
        throw new Error('Error deleting Form')
      }
      req.session.success = 'Form deleted!'
    } catch (err) {
      req.session.error = err;
    } finally {
      res.redirect(`/locations/${currentLocation._id}`);
    }
  }
};