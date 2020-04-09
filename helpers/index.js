const User = require('../models/user');
const Company = require('../models/company');
const Location = require('../models/location');
const Form = require('../models/form');
const Response = require('../models/response');
const fs = require('fs');

module.exports = {
    async newObjectErrorHandler (err, objects, res) {
        console.log(err);
        for (let object of objects) {
            console.log(`Deleting created ${object.constructor.modelName} object to try again`);
            await object.constructor.findByIdAndDelete(object._id);
        }
        return res.redirect('/users/dashboard');
    },
    getStateNamesAndAbbrs() {
        const statesJSON = fs.readFileSync('./private/states.json');
        const provincesJSON = fs.readFileSync('./private/provinces.json');
        const USStates = JSON.parse(statesJSON);
        const CANProvinces = JSON.parse(provincesJSON);
        let allItems = {};
        return Object.assign(allItems, USStates,CANProvinces);
  }
};
