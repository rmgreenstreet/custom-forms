const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({

});

module.exports = mongoose.Model('Response', responseSchema);