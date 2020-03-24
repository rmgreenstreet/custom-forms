// const express = require('express');
// const app = express();
// if (app.get('env') == 'development'){ require('dotenv').config(); }

const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const crypto = require('crypto');
const ejs = require('ejs');
const Location = require('../models/location');
const User = require('../models/user');

module.exports = {
    async routeByRole(req, res, next) {
        console.log('getting dashboard');
        const user = await User.findById(req.user._id);
        console.log(user);
        if(!user) {
          req.session.error = "User could not be found"
          return res.redirect('/')
        }
        if(user.role === 'Owner') {
          res.render('../views/owner/dashboard', {user});
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
        }
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
            console.log(err);
            await User.findByIdAndDelete(newUser._id);
            req.session.error = `Error updating Location`
            return res.redirect('/users/dashboard');
          }
        }
      }
      
      let locationContacts;
      try {
        locationContacts = await currentUser.location.sendContactEmails();
      } catch (err) {
        console.log(err);
        await User.findByIdAndDelete(newUser._id);
        req.session.error = `Error getting location's contacts to BCC`
        return res.redirect('/users/dashboard');
      }
      console.log('creating message to send to new user');
      let messageHTML;
      try {
        messageHTML = await ejs.renderFile('./private/invitation.ejs',{currentUser, newUser});
      } catch (err) {
        console.log(err);
        await User.findByIdAndDelete(newUser._id);
        req.session.error = `Error rendering message HTML`
        return res.redirect('/users/dashboard');
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
        console.log(err.response.body.errors);
        await User.findByIdAndDelete(newUser._id);
        req.session.error = `Error creating message object`
        return res.redirect('/users/dashboard');
      }
      try {
        await sgMail.send(msg);
        console.log('message sent to new user');
      } catch (err) {
        console.log(err.response.body);
        await User.findByIdAndDelete(newUser._id);
        req.session.error = `Error creating message object`
        return res.redirect('/users/dashboard');
      }
      try {
        await currentUser.save();
        console.log('currentUser saved');
        await currentUser.location.save();
        console.log('currentUser\'s location saved');
      } catch (err) {
        console.log(err);
        await User.findByIdAndDelete(newUser._id);
        req.session.error = `Error creating message object`
        return res.redirect('/users/dashboard');
      }
      req.session.success = 'Invitation successfully sent!';
      res.redirect('/users/dashboard');
    }
};