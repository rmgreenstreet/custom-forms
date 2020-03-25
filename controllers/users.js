const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
const Question = require('../models/question');

async function getRecentDocuments(documentType, populatePath, populateModel) {
  if(populatePath && populateModel) {
    return await documentType.find({})
    .where('created')
    .gt(Date.now() - (1000 * 60 * 60 * 24 * 3))
    .limit(10)
    .populate({
      path: populatePath,
      model: populateModel
    });
  } else {
    return await documentType.find({})
    .where('created')
    .gt(Date.now() - (1000 * 60 * 60 * 24 * 3))
    .limit(10);
  }
  
};

async function dashboardErrorHandler(err, message = `Error loading the page`) {
  console.log(err);
  req.session.error = message;
  return res.redirect('back');
}

module.exports = {
    async routeByRole(req, res, next) {
        console.log('getting dashboard');
        const user = req.user;
        if(!user) {
          req.session.error = "You must be logged in to do that"
          return res.redirect('/login')
        }
        if(user.role === 'Owner') {
          console.log(`This is a site owner, getting owner dashboard`);
          let recentCompanies;
          let recentLocations;
          let recentForms;
          let allQuestions;
          let totalCompanies;
          let totalLocations;
          let totalForms;
          try {
            recentCompanies = await Company.find({joined: {$gt: Date.now() - (1000 * 60 * 60 * 24 * 3) }});
            // getRecentDocuments(Company, 'locations','Location');
            totalCompanies = await Company.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Company data`);
          };

          try {
            allLocations = await Location.find({}, 'name officeNumber totalMonthlyExpedited').sort('officeNumber');
            totalLocations = await Location.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Location data`);
          };

          try {
            recentForms = await getRecentDocuments(Form);
            totalForms = await Form.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Form data`);
          };

          try {
            allQuestions = await Question.find({});
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Question data`);
          };

          try {
            res.render('../views/owner/dashboard', {recentCompanies,allLocations,recentForms,allQuestions, totalCompanies, totalForms, totalLocations});
          } catch (err) {
            dashboardErrorHandler(err,`Error loading dashboard`);
          };
          
        } else if (user.role === 'Admin') {
          console.log('this is an admin, getting dashboard for this location');
          try {
            const location = await Location.findById(user.location);
            // console.log(location);
            const recentInvitations = await User.find({location:req.user.location}).limit(10);
            // console.log(recentInvitations);
            res.render('../views/admin/dashboard', {user, recentInvitations, location});
          } catch (err) {
            req.session.error('Unable to find recent statistics');
          }
        } else if (user.role === 'User') {
          res.render('../views/user/dashboard', {user});
        } else {
          req.session.error = "User could not be found"
          res.redirect('/')
        };
    },
    async sendInvitation(req,res,next) {
      let newUser;
      let currentUser;
      console.log('Getting current user with location');
      try {
        currentUser = await User.findById(req.user._id).populate({
          path:'location',
          model:'Location'
        });
      } catch (err) {
        console.log(err);
        req.session.error = 'Unable to populate current user for invitation. Please try again';
        return res.redirect('/users/dashboard');
      }
      console.log('got current user with location:',currentUser.location);
      console.log('creating new user');
      try {
        newUser = await User.register({
          firstname: req.body.firstName,
          lastname: req.body.lastName,
          username: req.body.firstName+req.body.lastName,
          personalEmail: req.body.email,
          company: currentUser.company,
          location: currentUser.location
        },`Password${currentUser.location.officeNumber}`);
      } catch (err) {
        console.log(err);
        if (err.message.includes('UserExistsError')) {
          req.session.error = `This user already exists. <a href="">Click here</a> to resend an invitation to this user`
        }
        req.session.error = 'Unable to create new user for invitation. Please try again';
        return res.redirect('/users/dashboard');
      }
      
      if (req.body.isExpedited) {
        if (currentUser.location.totalMonthlyExpedited >= 3) {
          req.session.error = 'However, an expedited invitation cannot be sent, because the Monthly Limit for expedited setups has been reached for your company. This will reset on the first of the month.';
        } else {
          try {
            newUser.isExpedited = true;
            let location = await Location.findById(currentUser.location._id);
            location.totalMonthlyExpedited ++ ;
            await location.save();
          } catch (err) {
            req.session.error = `Error updating Location`
            await newUserErrorHandler(err, newUser);
          }
        }
      }
      
      let locationContacts;
      try {
        locationContacts = await currentUser.location.sendContactEmails();
      } catch (err) {
        req.session.error = `Error getting location's contacts to BCC`
        await newUserErrorHandler(err, newUser);
      }
      console.log('creating message to send to new user');
      let messageHTML;
      try {
        messageHTML = await ejs.renderFile('./private/invitation.ejs',{currentUser, newUser});
      } catch (err) {
        console.log(err);
        req.session.error = `Error rendering message HTML`;
        await newUserErrorHandler(err, newUser);
      }
      let msg;
      try {
        msg = {
          to: newUser.personalEmail,
          from: currentUser.personalEmail,
          bcc: [locationContacts],
          subject: `Getting Started At ${currentUser.location.name} - ${req.body.firstName} ${req.body.lastName}`,
          html: messageHTML
        };
      } catch (err) {
        req.session.error = `Error creating message object`;
        await newUserErrorHandler(err, newUser);
      }
      try {
        await sgMail.send(msg);
        console.log('message sent to new user');
      } catch (err) {
        req.session.error = `Error creating message object`;
        await newUserErrorHandler(err, newUser);
      }
      try {
        await currentUser.save();
        console.log('currentUser saved');
        await currentUser.location.save();
        console.log('currentUser\'s location saved');
      } catch (err) {
        req.session.error = `Error creating message object`
        await newUserErrorHandler(err, newUser);0
      }
      req.session.success = 'Invitation successfully sent!';
      res.redirect('/users/dashboard');
    }
};