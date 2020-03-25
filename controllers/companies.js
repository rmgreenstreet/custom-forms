const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const Form = require('../models/form');
const inputTypes = require('../models/inputTypes');

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
  async postCompanyCreate (req,res,next) {

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
    console.log(inputTypes)
    res.render('../views/owner/forms/edit.ejs', {currentForm,inputTypes});
  }
};