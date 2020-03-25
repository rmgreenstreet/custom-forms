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
            type:Schema.Types.ObjectId,
            ref: 'Location'
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

companySchema.pre('remove', async function() {
    Location.deleteMany({company: this._id});
});

module.exports = mongoose.model('Company', companySchema);