const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
const Question = require('../models/question');

const { newUserErrorHandler } = require('../helpers');

async function getRecentDocuments(documentType, beginDate, endDate, populatePath, populateModel) {
  if(populatePath && populateModel) {
    return await documentType.find({})
    .where('created')
    .gt(beginDate)
    .lt(endDate)
    .limit(10)
    .populate({
      path: populatePath,
      model: populateModel
    });
  } else {
    return await documentType.find({})
    .where('created')
    .gt(beginDate)
    .lt(endDate)
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
          let allLocations;
          let recentLocations;
          let recentForms;
          let totalQuestions;
          let totalCompanies;
          let totalForms;
          let recentCompletions;
          let beginDate = new Date();
          beginDate.setMonth(beginDate.getMonth() -6);
          if (req.body.beginDate) {
            beginDate = req.body.beginDate;
          }
          console.log(`beginDate: ${beginDate}`);
          let endDate = new Date();
          if (req.body.endDate) {
            endDate = req.body.endDate
          }
          console.log(`endDate: ${endDate}`);
          try {
            recentCompanies = await getRecentDocuments(Company, beginDate, endDate, null, null);
            totalCompanies = await Company.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Company data`);
          };

          try {
            allLocations = await Location.find({}, 'name officeNumber totalMonthlyExpedited').sort('officeNumber');
            recentLocations = getRecentDocuments(Location, beginDate, endDate);
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Location data`);
          };

          try {
            recentForms = await getRecentDocuments(Form, 3);
            totalForms = await Form.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Form data`);
          };

          try {
            totalQuestions = await Question.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Question data`);
          };

          try {
            res.render('../views/owner/dashboard', {recentCompanies, recentLocations, allLocations,recentForms,totalQuestions, totalCompanies, totalForms, page:'ownerDashboard'});
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
      let currentLocation;
      console.log('Getting location');
      try {
        console.log(req.body.locationSelector);
        if(req.body.locationSelector) {
          currentLocation = await Location.findById(req.body.locationSelector).populate({
            path:'contacts',
            model: 'User'
          });
        } else {
          currentLocation = await Location.findById(req.user.location).populate({
            path:'contacts',
            model:'User'
          });
        }
        
      } catch (err) {
        req.session.error = 'Unable to get location data. Please try again';
        return res.redirect('/users/dashboard');
      }
      console.log('Got Location:',currentLocation.name);
      console.log('creating new user');
      try {
        const existingUser = await User.find({personalEmail:req.body.email});
        if(!existingUser) {
          newUser = await User.register({
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            username: req.body.firstName+req.body.lastName,
            personalEmail: req.body.email,
            company: currentLocation.company,
            location: currentLocation._id
          },`Password${currentLocation.officeNumber}`);
        } else {
          newUser = existingUser;
        }
        
      } catch (err) {
        console.log(err);
        if (err.message.includes('UserExistsError')) {
          req.session.error = `This user already exists. <a href="">Click here</a> to resend an invitation to this user`
        }
        req.session.error = 'Unable to create new user for invitation. Please try again';
        return res.redirect('/users/dashboard');
      }
      console.log('creating message to send to new user');
      let messageHTML;
      try {
        messageHTML = await ejs.renderFile('./private/invitation.ejs',{currentLocation, newUser});
      } catch (err) {
        req.session.error = `Error rendering message HTML`;
        await newUserErrorHandler(err, newUser, res);
      }
      let msg;
      try {
        msg = {
          to: newUser.personalEmail,
          from: currentLocation.contacts[0].personalEmail,
          bcc: [await currentLocation.sendContactEmails()],
          subject: `Getting Started At ${currentLocation.name} - ${req.body.firstName} ${req.body.lastName}`,
          html: messageHTML
        };
      } catch (err) {
        req.session.error = `Error creating message object`;
        await newUserErrorHandler(err, newUser, res);
      }
      try {
        await sgMail.send(msg);
        console.log('message sent to new user');
      } catch (err) {
        req.session.error = `Error sending message`;
        await newUserErrorHandler(err, newUser, res);
      }


      try {
        // await currentUser.save();
        // console.log('currentUser saved');
        if (req.body.isExpedited) {
          if (currentLocation.totalMonthlyExpedited >= 3) {
            req.session.error = 'However, an expedited invitation cannot be sent, because the Monthly Limit for expedited setups has been reached for your company. This will reset on the first of the month.';
          } else {
            newUser.isExpedited = true;
            currentLocation.totalMonthlyExpedited ++ ;
          }
        }
        await currentLocation.save();
        console.log('currentUser\'s location saved');
      } catch (err) {
        req.session.error = `Error updating expedited count`
        await newUserErrorHandler(err, newUser, res);
      }

      
      req.session.success = 'Invitation successfully sent!';
      res.redirect('/users/dashboard');
    }
};


// try {
//   var newUser = User.create({
//     name:'John'
//   });
// } catch (err) {
//   //handle the error differently here
// }

// try {
//   //after creating the user, other stuff happens that could cause an error
// } catch (err) {
//   req.session.error = 'There was an error';
//   //passes the newUser into the error handler to be removed in order to start over
//   await myErrorHandler(err, newUser)
// }