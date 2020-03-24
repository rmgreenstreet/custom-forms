const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
const inputTypes = require('../models/inputTypes');

async function newUserErrorHandler(err, newUser) {
  console.log(err);
  await User.findByIdAndDelete(newUser._id);
  return res.redirect('/users/dashboard');
}

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
    async getFormEdit(req, res, next) {
      const currentForm = await Form.findById(req.params.id).populate({
        path: 'questions',
        model:'Question'
      });
      console.log(inputTypes)
      res.render('../views/admin/forms/edit.ejs', {currentForm,inputTypes});
    }
};