const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Form = require('./form');
const fs = require('fs');

async function getStatesAndProvinces() {
    const statesJSON = fs.readFileSync('./private/states.json');
    const provincesJSON = fs.readFileSync('./private/provinces.json');
    const USStates = JSON.parse(statesJSON);
    const CANProvinces = JSON.parse(provincesJSON);

    const stateAbbrs = Object.keys(USStates);
    const provinceAbbrs = Object.keys(CANProvinces);

    return [...stateAbbrs,...provinceAbbrs];
}


const locationSchema = new Schema({
    primary: {
        type:Boolean,
        default:true
    },
    officeNumber:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    fax: {
        type:String,
        required:true
    },
    address: {
        required: true,
        type: {
            streetNumber: {
                type:Number,
                required:true
            },
            streetName: {
                type:String,
                required:true
            },
            secondary: String,
            city: {
                type:String,
                required:true
            },
            state: {
                type:String,
                minlength:2,
                maxlength:2,
                required:true,
                enum: getStatesAndProvinces()
            },
            postal: {
                type:String,
                minlength:5,
                maxlength:7,
                required:true
            },
            country: {
                type: String,
                enum: ['USA', 'CAN']
            }
        }
    },
    website: {
        type: Schema.Types.Url,
        required:true
    },
    images: {
        required:true,
        type: [
            {
                secure_url: String,
                public_id: String
            }
        ]
    },
    contacts: [
        {
            type:Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    forms: [
        {
            type:Schema.Types.ObjectId,
        }
    ],
    totalMonthlyExpedited:Number,
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    }
});

locationSchema.method('addDefaultForm', async function () {
    const defaultForm = await Form.create({});
    await defaultForm.addDefault();
    this.forms.push(defaultForm._id);
    await this.save();
});

locationSchema.pre('remove', async function() {
    for(let contact of this.contacts) {
        User.findByIdAndRemove(contact);
    }
});

locationSchema.method('sendContactEmails', async function () {
    let contactEmails = [];
    for(let contact of this.contacts) {
        const currentContact = User.findById(contact);
        contactEmails.push(currentContact.personalEmail);
    };
    return contactEmails.join(',');
});

module.exports = mongoose.model('Location', locationSchema);