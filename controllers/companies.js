const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
// const { sendInvitation } = require('./users')
const inputTypes = require('../models/inputTypes');

const { newObjectErrorHandler, getRecentDocuments, monthDiff, dashboardErrorHandler } = require('../helpers');

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
  async getCompanyProfile(req, res, next) {
    let currentCompany;
    let userCount = [];
    let companyAdmins = [];
    let locationAdmins = [];
    let recentInvitations;
    let recentCompletions = [];
    let recentSetups;
    let beginDate = new Date();
    beginDate.setMonth(beginDate.getMonth() - 5);
    if (req.body.beginDate) {
      const dateArr = req.body.beginDate.split('-');
      beginDate = new Date(parseInt(dateArr[0]),parseInt(dateArr[1]) - 1, dateArr[1]);
    };
    
    let endDate = new Date();
    if (req.body.endDate) {
      const dateArr = req.body.endDate.split('-');

      endDate = new Date(parseInt(dateArr[0]),parseInt(dateArr[1] - 1), dateArr[1]);
    };
    const dateRange = monthDiff(beginDate, endDate) + 2;
    let datePoints = [];
    for (let i = beginDate.getMonth(); i < beginDate.getMonth() + dateRange; i ++) {
      if (i <= 11) {
        datePoints.push({x: `${i + 1}/${beginDate.getFullYear()}`, y:0});
      } else {
        datePoints.push({x: `${i - 11}/${beginDate.getFullYear() + 1}`, y:0});
      }
    }
    try {
      currentCompany = await Company
      .findById(req.params.companyId)
      .populate({
        path: 'locations',
        model: 'Location',
        populate: {
          path: 'contacts',
          model: 'User'
        }
      }).exec();
    } catch (err) {
      console.log(err);
      req.session.error = 'Error loading Company';
      res.redirect('/users/dashboard');
    }

    try {
      for (let location of currentCompany.locations) {
        companyAdmins.push(location.contacts.find(contact => contact.isCompanyAdmin === true));
      }
    } catch (err) {
      console.log(err)
      req.session.error = 'Unable to get Primary Contacts'
    }
    try {
      for (let location of currentCompany.locations) {
        locationAdmins.push(...location.contacts);
      }
    } catch (err) {
      console.log(err)
      req.session.error = 'Unable to get Primary Contacts'
    }

    try {
      for (let location of currentCompany.locations) {
        userCount.push({
          count: await User.countDocuments({location:location._id}),
          location: location._id})
      }
    } catch (err) {
      console.log(err)
      req.session.error = 'Error loading users for all locations'
    }

    try {
      recentInvitations = await getRecentDocuments(User, beginDate, endDate, 0, 'company', currentCompany._id);
    } catch (err) {
      dashboardErrorHandler(err,`Error loading recent Invitations`);
    };

    try {
      const allCompletions = await User.find({
        responses: {$ne: []},
        company: currentCompany._id
      })
      .populate({
        path: 'responses',
        model: 'Response'
      });
      for (let completion of allCompletions) {
        for (let response of completion.responses) {
          let currentDate = response.created.toJSON().slice(0,10);
          let compareBeginDate = beginDate.toJSON().slice(0,10);
          let compareEndDate = endDate.toJSON().slice(0,10);
          if (currentDate >= compareBeginDate && currentDate <= compareEndDate) {
            recentCompletions.push(response);
          };
        };
      };
    } catch (err) {
      dashboardErrorHandler(err,`Error loading recent Completions`);
    };

    try {
      recentSetups = await User.find({
        completedSetup: {
          $gte: beginDate, 
          $lte: endDate
        },
        company: currentCompany._id
      }).sort('completedSetup');
    } catch (err) {
      dashboardErrorHandler(err,`Error loading recent Setups`);
    };

    try {
      const graphDatasets = [
        [
          {label:'Invitations',payload:recentInvitations,searchProperty:'created'},
          {label:'Completions',payload:recentCompletions,searchProperty:'created'},
          {label:'Setups',payload:recentSetups,searchProperty:'completedSetup'}
        ]            
      ];
      res.render('../views/company/profile.ejs', {locationAdmins, datePoints, beginDate, endDate, graphDatasets, currentCompany, userCount, companyAdmins, page: 'companyProfile', title: 'Company Profile'});
    } catch (err) {
      console.log(err);
      req.session.error = 'Error rendering Company profile';
      res.redirect('/users/dashboard');
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
    res.render('../views/company./edit.ejs', {company});
  },
  async putCompanyEdit (req, res, next) {
    // let currentCompany;
    let existingAdmins;
    let newPrimaryLocation;
    let oldPrimaryLocation;

    // try {
    //   currentCompany = await Company.findById(req.user.company);
    // } catch (err) {

    // }

    try {
      existingAdmins = await User.find({
        company: req.user.company,
        isCompanyAdmin: true
      });
    } catch (err) {

    }

    for (let user of existingAdmins) {
      if (!req.body.chooseAdmins.includes(user._id)) {
        user.isCompanyAdmin = false;
        try {
          user.save();
        } catch (err) {

        };
      }
    }

    for (let admin of req.body.chooseAdmins) {
      let currentAdmin;
      try {
        currentAdmin = await User.findById(admin);
      } catch (err) {

      }

      if (currentAdmin.isCompanyAdmin) {
        continue;
      } else {
        currentAdmin.isCompanyAdmin = true;
      }

      try {
        currentAdmin.save();
      } catch (err) {

      }
    }
    
    try {
      oldPrimaryLocation = await Location.find({
        isPrimary: true,
        company: req.user.company
      });
    } catch (err) {

    }

    if (oldPrimaryLocation._id.equals(req.body.choosePrimaryLocation)) {
      continue;
    } else {
      try {
        newPrimaryLocation = await Location.findById(req.body.choosePrimaryLocation);
      } catch (err) {

      }
      oldPrimaryLocation.isPrimary = false;
      newPrimaryLocation.isPrimary = true;
      try {
        await oldPrimaryLocation.save();
      } catch (err) {

      }
      try {
        await newPrimaryLocation.save();
      } catch (err) {


      }
    }
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