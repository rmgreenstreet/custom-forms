const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
// const { sendInvitation } = require('./users')
const inputTypes = require('../models/inputTypes');

const { newObjectErrorHandler } = require('../helpers');

module.exports = {
  async getCompaniesIndex(req,res,next) {
    let allCompanies;
    try {
      allCompanies = await Company.find({}).populate({
        path:'locations',
        model: 'Location'
      });
    } catch (err) {
      console.log(err);
      req.session.error = 'Error getting Companies list'
      return res.redirect('back');
    };
    try {
      res.render('../views/owner/companies/index',{allCompanies});
    } catch (err) {
      console.log(err);
      req.session.error = 'Error loading Companies page'
      return res.redirect('back');
    }
  },
  async postNewCompany (req,res,next) {
    let newCompany;
    let newLocation;
    let newContact;
    let createdUser;
    try {
      newCompany = await Company.create({name:req.body.location.name});
    } catch (err) {
      req.session.error = 'Error Creating Company'
      await newObjectErrorHandler(err, newCompany, res)
    }
    try {
      newLocation = await Location.create(req.body.location);
      newLocation.company = newCompany._id;
      await newLocation.save();
      newCompany.locations.push(newLocation._id);
      await newCompany.save();
    } catch (err) {
      req.session.error = 'Error Creating Location'
      await newObjectErrorHandler(err, [newCompany, newLocation], res);
    }
    try { 
      newContact = req.body.contact;
      newContact.location = newLocation._id;
      newContact.company = newCompany._id;
      newContact.username = req.body.contact.firstName+req.body.contact.lastName;
      newContact.role = 'Admin';
      newContact.isCompanyAdmin = true;
      createdUser = await User.create(newContact);
      newLocation.contacts.push(createdUser._id);
      await newLocation.save();
      await createdUser.sendInvitation();
      req.session.success = `Company ${newCompany.name} successfully created!`;
      res.redirect('/users/dashboard');
    } catch (err) {
      req.session.error = 'Error Creating User'
      await newObjectErrorHandler(err, [newCompany, newLocation, createdUser], res);
    }
  },
  async getFormsIndex(req,res,next) {
    let company;
    try {
      console.log(`Getting company, list of locations, & list of forms`);
      company = await Company.findById(req.params.companyId).populate({
          path: 'locations',
          model: 'Location',
          populate: {
              path:'forms',
              model: 'Form'
          }
      });
    } catch (err) {
      console.log(err);
      req.session.error = 'Unable to load Company data';
      return res.redirect('back')
    };
    try {
        res.render('../views/admin/forms/index.ejs',{company});
      } catch (err) {
        console.log(err);
        req.session.error = 'Error loading Company page'
        return res.redirect('back');
      }
    
  },
  async getCompanyEdit(req, res, next) {
    const company = await Company.findById(req.params.companyId).populate({
      path: 'locations',
      model:'Location'
    });
    res.render('../views/owner/companies/edit.ejs', {company});
  },
  async getLocationEdit(req, res, next) {
    const location = await Location.findById(req.params.locationId).populate({
      path: 'contacts',
      model:'User'
    });
    res.render('../views/owner/companies/locations/edit.ejs', {location});
  },
  async getFormEdit(req, res, next) {
    const currentForm = await Form.findById(req.params.formId).populate({
      path: 'questions',
      model:'Question'
    });
    res.render('../views/owner/forms/edit.ejs', {currentForm,inputTypes});
  }
};