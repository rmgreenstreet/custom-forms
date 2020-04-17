const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const Response = require('./response');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const crypto = require('crypto');
const ejs = require('ejs');


const forbiddenWords = ['realtor', 'realty', 'realestate', 'agent', 'broker', 'admin'];

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: String,
    personalEmail:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        default:'User'
    },
    isCompanyAdmin: {
        type:Boolean,
        default: false
    },
    company: {
        type:Schema.Types.ObjectId,
        ref: 'Company'
    },
    location: {
        type:Schema.Types.ObjectId,
        ref: 'Location'
    },
    image: {
        secure_url: {
            type:String,
            default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        },
        public_id: String
    },
    isExpedited: {
        type:Boolean,
        default:false
    },
    isHidden: {
        type:Boolean,
        default:false
    },
    formAccessToken: {
        type: String,
        default: crypto.randomBytes(16).toString('hex')
    },
    completedSetup: Date,
    responses: [
        {
            type:Schema.Types.ObjectId,
            ref:'Response'
        }
    ],
    createAccountToken : {
        type: String,
        default: crypto.randomBytes(16).toString('hex')
    },
    resetPasswordToken : String,
    resetPasswordExpires: Date,
    created:{
        type:Date,
        default: new Date()
    }
});

userSchema.pre('remove', async function() {
    for (let response of this.responses) {
        await Response.findByIdAndRemove(response);
    };
});

userSchema.method('makeAdmin', async function () {
    this.role = 'Admin';
    await this.save();
});

userSchema.method('sendInvitation', async function (attrs = {}) {
    const Location = require('./location');
    let userLocation;
    let bccs;
    let msg;
    try {
        userLocation = await Location.findById(this.location).populate({
            path:'contacts',
            model:'User'
        }).exec();
    } catch (err) {
        throw err;
    }
    try {
        bccs = await userLocation.sendContactEmails();
    } catch (err) {
        throw err;
    }
    let messageHTML;
    try {
        messageHTML = await ejs.renderFile('./private/invitation.ejs', {newUser:this, currentLocation:userLocation,attrs});
    } catch (err) {
        throw err;
    }
    try {
        if (bccs.indexOf(this.personalEmail) > -1) {
            bccs.splice(bccs.indexOf(this.personalEmail),1);
        };
        msg = {
            to:this.personalEmail,
            from:'Site Admin <rgreenstreetdev@gmail.com>',
            bcc:bccs,
            subject:`${this.firstName} ${this.lastName} - Setup Invitation From ${userLocation.name} - ${userLocation.address.city} #${userLocation.officeNumber}`,
            html: messageHTML
        };
    } catch (err) {
        throw err;
    }
    try {
        await sgMail.send(msg);
    } catch (err) {
        throw err;
    }
});

userSchema.method('markFormCompleted', async function (attrs = {}) {
    const Location = require('./location');
    this.save();
    const userLocation = Location.findById(this.location);
    const bccs = await userLocation.sendContactEmails();
    const msg = {
        to:this.personalEmail,
        from:'Site Admin <info@greenstreetimagining.com>',
        bcc:bccs,
        subject:`${this.firstName} ${this.lastName} ${this.title} Form Received - ${userLocation.city} #${userLocation.officeNumber}`,
        html: await ejs.renderFile('../private/completedForm', {user:this, attrs})
    };
    await sgMail.send(msg);
});

userSchema.method('markSetupCompleted', async function (attrs = {}) {
    const Location = require('./location');
    this.completedSetup = Date.now();
    await this.save();
    const bccs = await Location.findById(this.location).sendContactEmails();
    const msg = {
        to:this.personalEmail,
        from:'Site Admin <info@greenstreetimagining.com>',
        bcc:bccs,
        subject:`${this.firstName} ${this.lastName} ${this.title} Setup Complete - ${userLocation.city} #${userLocation.officeNumber}`,
        html: await ejs.renderFile('../private/completedSetup', {user:this, attrs})
    };
    await sgMail.send(msg);
});

async function checkForForbiddenWords (input) {

};

// userSchema.queue('sendInvitation', []);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);