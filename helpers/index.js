const User = require('../models/user');
const Company = require('../models/company');
const Location = require('../models/location');
const Form = require('../models/form');
const Response = require('../models/response');
const fs = require('fs');

module.exports = {
    async newObjectErrorHandler (err, objects, res) {
        console.error(err);
        for (let object of objects) {
            console.log(`Deleting created ${object.constructor.modelName} object to try again`);
            await object.constructor.findByIdAndDelete(object._id);
        }
        return res.redirect('/users/dashboard');
    },
    dashboardErrorHandler(err, message = `Error loading the page`) {
        console.error(err);
        req.session.error = message;
        return res.redirect('/');
    },
    getStateNamesAndAbbrs() {
        const statesJSON = fs.readFileSync('./private/states.json');
        const provincesJSON = fs.readFileSync('./private/provinces.json');
        const USStates = JSON.parse(statesJSON);
        const CANProvinces = JSON.parse(provincesJSON);
        let allItems = {};
        return Object.assign(allItems, USStates,CANProvinces);
    },
    async getRecentDocuments(documentType, beginDate, endDate, limit = 0, searchField = '', searchValue = '') {
        let query = {
            created: {
                $gte: beginDate, 
                $lte: endDate
            }
        }; 
        if (searchField !== '' && searchValue !== '') {
            query[searchField] = searchValue;
        }
        return await documentType.find(query)
        .limit(limit)
        .sort('-created');  
    },
    flipACoin() {
        const yesOrNo = Math.floor(Math.random() *2);
        return yesOrNo;
    },
    async pickADate(minDate = new Date().setFullYear(new Date().getFullYear() -1)) {
        return new Promise((resolve, reject) => {
            try {
                const today = new Date();
                const returnDate = new Date(+minDate + Math.random() * (today - minDate))
                resolve(returnDate);
                return;
            } catch (err) {
                console.log(`Error creating random date: ${err.message}`);
                reject(new Date());
                return;
            }
        });
    },
    monthDiff(d1, d2) {
        let months;
        months = ((d2.getFullYear() - d1.getFullYear()) * 12);
        months -= d1.getMonth() + 1;
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }
};
