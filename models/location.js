const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Form = require('./form');
const fs = require('fs');

async function getStateAbbrs() {
    const statesJSON = await fs.readFileSync('./private/states.json');
    const provincesJSON = await fs.readFileSync('./private/provinces.json');
    const USStates = await JSON.parse(statesJSON);
    const CANProvinces = await JSON.parse(provincesJSON);

    const stateAbbrs = Object.keys(USStates);
    const provinceAbbrs = Object.keys(CANProvinces);

    return [...stateAbbrs,...provinceAbbrs];
}


const locationSchema = new Schema({
    isPrimary: {
        type:Boolean,
        default:false
    },
    officeNumber:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    fax: String,
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
                enum: getStateAbbrs()
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
            ref: 'Form'
        }
    ],
    expedited: [
        {
            month: {
                type: Number,
                default: new Date().getMonth()
            },
            year: {
                type: Number,
                default: new Date().getFullYear()
            },
            total: {
                type: Number,
                default: 0
            }
        }
    ],
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    created: {
        type: Date,
        default: new Date()
    }
});

locationSchema.method('addDefaultForm', async function () {
    const defaultForm = await Form.create({});
    await defaultForm.addDefault();
    this.forms.push(defaultForm._id);
    await this.save();
});

locationSchema.pre('remove', async function() {f
    const User = require('./user');
    for(let contact of this.contacts) {
        await User.findByIdAndRemove(contact);
    }
});

locationSchema.method('sendContactEmails', async function () {
    const User = require('./user');
    let contactEmails = [];
    // const allContacts = await User.find({location:this._id});
    // for (let contact of allContacts) {
    //     contactEmails.push(contact.personalEmail);
    // }
    try {
        for(let contact of this.contacts) {
            const currentContact = await User.findById(contact);
            contactEmails.push(currentContact.personalEmail);
        };
        return contactEmails;
    } catch (err) {
        throw err;
    }
});

module.exports = mongoose.model('Location', locationSchema);