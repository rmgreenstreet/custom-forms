const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Location = require('./location');

const companySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    locations: [
        {
            type:Schema.Types.ObjectId
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
});

companySchema.pre('remove', async function() {
    for (let location of this.locations) {
        console.log('removing all locations');
        Location.findOneAndRemove(location);
    }
});

module.exports = mongoose.model('Company', companySchema);