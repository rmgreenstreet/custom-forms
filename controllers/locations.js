const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');

const { newObjectErrorHandler } = require('../helpers');

module.exports = {
    async getLocationsIndex (req,res,next) {

    },
    async getLocationEdit (req,res,next) {

    },
    async postNewLocation (req,res,next) {
        let createdLocation;
        let currentCompany;
        let createdContact;
        try {
            try {
                currentCompany = await Company.findById(req.body.companyId);
            } catch (err) {
                console.error(err);
                throw new Error('Error loading Company to add new Location')
            }

            try {
                let newLocation = req.body.company;
                newLocation.company = currentCompany._id;
                createdLocation = await Location.create(newLocation);
                try {
                    await createdLocation.addDefaultForm();
                } catch (err) {
                    await createdLocation.remove();
                    throw err;
                }
            } catch (err) {
                console.error(err);
                throw new Error('Error creating new Location');
            }

            try {
                let newContact = req.body.contact;
                newContact.role = 'Admin';
                newContact.company = currentCompany._id;
                newContact.location = createdLocation._id;
                createdContact = await User.create(newContact);
            } catch (err) {
                await createdLocation.remove();
                throw new Error('Error creating Contact for new Location');
            }

            try {
                createdLocation.contacts.push(createdContact._id);
                await createdLocation.save();
            } catch (err) {
                console.error(err);
                throw new Error('Error adding Contact to new Location')
            }

            try {
                currentCompany.locations.push(createdLocation._id);
                await currentCompany.save();
            } catch (err) {
                console.error(err);
                throw new Error('Error adding new Location to Company')
            }

            req.session.success = 'New Location '+createdLocation.name+' Successfully Created!';

        } catch (err) {
            req.session.error = err;
        } finally {
            res.redirect('/users/dashboard');
        }
    },
    async getLocationProfile (req,res,next) {

    },
    async putLocationEdit (req,res,next) {

    }
};