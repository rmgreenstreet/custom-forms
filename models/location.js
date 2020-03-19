const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

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
        type:Number,
        required:true
    },
    fax: {
        type:Number,
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
            city: {
                type:String,
                required:true
            },
            state: {
                type:String,
                minlength:2,
                required:true
            },
            postal: {
                type:String,
                minlength:5,
                maxlength:7,
                required:true
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
                secure_url: Schema.Types.Url,
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
    ]  
});

locationSchema.method('sendContactEmails', async function () {
    let contactEmails = [];
    for(let contact of this.contacts) {
        const currentContact = User.findById(contact);
        contactEmails.push(currentContact.email);
    };
    return contactEmails.join(',');
});

module.exports = mongoose.model('Location', locationSchema);