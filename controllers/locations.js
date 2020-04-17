const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const moment = require('moment');
const Company = require('../models/company');
const Location = require('../models/location');
const User = require('../models/user');
const Form = require('../models/form');

const { newObjectErrorHandler, getStateNamesAndAbbrs, dashboardErrorHandler, monthDiff } = require('../helpers');
const states = getStateNamesAndAbbrs();

async function test() {
    console.log(await Form.findById('5e99efbff9b5213c186ff680'));
}
// test();
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
                let newLocation = req.body.location;
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
            res.redirect(`/companies/${currentCompany._id}`);
        }
    },
    async getLocationProfile (req,res,next) {
        let currentLocation;
        let locationUserCount = 0;
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

            try {
                currentLocation = await Location.findById(req.params.locationId)
                .populate('contacts')
                .populate('forms')
                .populate('company', 'name');
            } catch (err) {
                console.error(err);
                throw new Error('Error loading location data');
            }

            try {
                locationUserCount = await User.countDocuments({
                    location: currentLocation._id
                });
            } catch (err) {
                console.error(err);
                throw new Error('Error getting Location User count');
            }

            try {
                recentInvitations = await User.find({
                    created: {
                        $gte: beginDate,
                        $lte: endDate
                    },
                    location: currentLocation._id
                })
                .populate('responses');
            } catch (err) {
            dashboardErrorHandler(err,`Error loading recent Invitations`);
            };

            try {
            for (let invitation of recentInvitations) {
                if (invitation.responses.length > 0) {
                    for (let response of invitation.responses) {
                        if (response.created >= beginDate && response.created <= endDate) {
                            recentCompletions.push(response);
                        }
                    }
                }
            }
            } catch (err) {
            dashboardErrorHandler(err,`Error loading recent Completions`);
            };

            try {
            recentSetups = await User.find({
                completedSetup: {$gte: beginDate, $lte: endDate},
                location: currentLocation._id
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
                await res.render('../views/locations/profile.ejs', {beginDate, endDate, datePoints, graphDatasets, moment, currentLocation, locationUserCount});
            } catch (err) {
                console.error(err);
                throw Error('Error rendering Location Profile page')
            }

        } catch (err) {
            req.session.error = err;
            res.redirect('back');
        }
    },
    async putLocationEdit (req,res,next) {

    }
};