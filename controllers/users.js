const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');
const Question = require('../models/question');
const Response = require('../models/response');

const ejsLint = require('ejs-lint');

const { newObjectErrorHandler, getRecentDocuments, dashboardErrorHandler, monthDiff, getStateNamesAndAbbrs } = require('../helpers');
const states = getStateNamesAndAbbrs();

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
          let recentInvitations;
          let recentCompletions;
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
            recentCompanies = await getRecentDocuments(Company, beginDate, endDate);
            totalCompanies = await Company.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Company data`);
          };

          try {
            allLocations = await Location.find({}, 'name officeNumber expedited').sort('officeNumber');
            recentLocations = await getRecentDocuments(Location, beginDate, endDate);
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Location data`);
          };

          try {
            recentInvitations = await getRecentDocuments(User, beginDate, endDate);
          } catch (err) {
            dashboardErrorHandler(err,`Error loading recent Invitations`);
          };

          try {
            recentCompletions = await getRecentDocuments(Response, beginDate, endDate);
          } catch (err) {
            dashboardErrorHandler(err,`Error loading recent Completions`);
          };

          try {
            recentSetups = await User.find({completedSetup: {$gte: beginDate, $lte: endDate}}).sort('completedSetup');
          } catch (err) {
            dashboardErrorHandler(err,`Error loading recent Setups`);
          };

          // try {
          //   recentForms = await getRecentDocuments(Form, 3);
          //   totalForms = await Form.countDocuments();
          // } catch (err) {
          //   dashboardErrorHandler(err,`Error loading Form data`);
          // };

          try {
            totalQuestions = await Question.countDocuments();
          } catch (err) {
            dashboardErrorHandler(err,`Error loading Question data`);
          };

          try {
            const graphDatasets = [
              [
                {label:'Invitations',payload:recentInvitations,searchProperty:'created'},
                {label:'Completions',payload:recentCompletions,searchProperty:'created'},
                {label:'Setups',payload:recentSetups,searchProperty:'completedSetup'}
              ],
              [
                {label:'Companies',payload:recentCompanies,searchProperty:'created'},
                {label:'Locations',payload:recentLocations,searchProperty:'created'}
              ]             
            ];

            await res.render('../views/owner/dashboard', {states, datePoints, beginDate, endDate, recentCompanies, allLocations, recentInvitations, recentForms,totalQuestions, totalCompanies, totalForms, graphDatasets, page:'ownerDashboard'});
          } catch (err) {
            dashboardErrorHandler(err,`Error loading dashboard`);
          };
          
        } else if (user.role === 'Admin') {
          console.log('this is an admin, getting dashboard for this location');
          try {
            const location = await Location.findById(user.location);
            const recentInvitations = await User.find({location:req.user.location}).limit(10);
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
      try {
        console.log('Getting location');
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
        console.log('Got Location:',currentLocation.name);
      } catch (err) {
        req.session.error = 'Unable to get location data. Please try again';
        return res.redirect('/users/dashboard');
      }
      try {
        const existingUser = await User.findOne({personalEmail:req.body.email});
        if(!existingUser) {
          console.log('creating new user');
          newUser = await User.register({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.firstName+req.body.lastName,
            personalEmail: req.body.email,
            company: currentLocation.company,
            location: currentLocation._id
          },`Password${currentLocation.officeNumber}`);
          if(req.body.isHidden) {
            newUser.isHidden = true;
          }
        } else {
          console.log('user already exists, re-sending invitation');
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
        return await newObjectErrorHandler(err, newUser, res);
      }
      let msg;
      try {
        msg = {
          to: newUser.personalEmail,
          from: currentLocation.contacts[0].personalEmail,
          bcc: await currentLocation.sendContactEmails(),
          subject: `Getting Started At ${currentLocation.name} - ${newUser.firstName} ${newUser.lastName}`,
          html: messageHTML
        };
      } catch (err) {
        req.session.error = `Error creating message object`;
        return await newObjectErrorHandler(err, newUser, res);
      }
      try {
        await sgMail.send(msg);
        console.log('message sent to new user');
      } catch (err) {
        req.session.error = `Error sending message`;
        return await newObjectErrorHandler(err, newUser, res);
      }


      try {
        // await currentUser.save();
        // console.log('currentUser saved');
        if (req.body.isExpedited) {
          for (let item of currentLocation.expedited) {
            if (item.month == Date.now().getMonth() && item.year == Date.now().getFullYear && item.total >= 3) {
            req.session.error = 'However, an expedited invitation cannot be sent, because the Monthly Limit for expedited setups has been reached for your company. This will reset on the first of the month.';
            } else {
              newUser.isExpedited = true;
              item.total ++ ;
            }
          }
        }
        await currentLocation.save();
        await newUser.save();
        console.log('currentUser\'s location saved');
      } catch (err) {
        req.session.error = `Error updating expedited count`
        return await newObjectErrorHandler(err, newUser, res);
      }

      
      req.session.success = 'Invitation successfully sent!';
      res.redirect('/users/dashboard');
    }
};