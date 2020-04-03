const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const Location = require('./location');
const Response = require('./response');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const crypto = require('crypto');


const forbiddenWords = ['realtor', 'realty', 'realestate', 'agent', 'broker', 'admin'];

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: String,
    personalEmail:{
        type:String,
        required:true,
        unique:true
        // ,
        // validate: {
        //     validator: function(v) {
        //       console.log({ v });
        //       ;
        //     },
        //     message: props =>
        //       `${props.value} is not a valid email address`
        //   }
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
        url: {
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
        default:Date.now()
    }
});

userSchema.pre('remove', async function() {
    for (let response of this.responses) {
        Response.findByIdAndRemove(response);
    };
});

userSchema.method('makeAdmin', async function () {
    this.role = 'Admin';
    await this.save();
});

userSchema.method('sendInvitation', async function (attrs = {}) {

});

userSchema.method('markFormCompleted', async function (attrs = {}) {
    this.completedForm = true;
    await this.save();
    const userLocation = Location.findById(this.location);
    const bccs = await userLocation.sendContactEmails();
    const msg = {
        to:this.personalEmail,
        from:'Site Admin <info@greenstreetimagining.com>',
        bcc:bccs,
        subject:`${this.firstName} ${this.lastName} ${this.title} Form Received - ${userLocation.city} #${userLocation.officeNumber}`,
        text: await ejs.render('../private/completedForm', {user:this, attrs})
    };
    await sgMail.send(msg);
});

userSchema.method('markSetupCompleted', async function (attrs = {}) {
    this.completedSetup = true;
    await this.save();
    const userLocation = Location.findById(this.location);
    const bccs = await userLocation.sendContactEmails();
    const msg = {
        to:this.personalEmail,
        from:'Site Admin <info@greenstreetimagining.com>',
        bcc:bccs,
        subject:`${this.firstName} ${this.lastName} ${this.title} Setup Complete - ${userLocation.city} #${userLocation.officeNumber}`,
        text: await ejs.render('../private/completedSetup', {user:this, attrs})
    };
    await sgMail.send(msg);
});

async function checkForForbiddenWords (input) {

};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);