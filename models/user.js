const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const Company = require('./company');
const Location = require('./location');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        default:'User'
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
    totalMonthlyExpedited:Number,
    formAccessToken:String,
    completedForm:{
        type:Boolean,
        default:false
    },
    completedSetup:{
        type:Boolean,
        default:false
    },
    responses: [
        {
            type:Schema.Types.ObjectId,
            ref:'Response'
        }
    ],
    createAccountToken : String,
    resetPasswordToken : String,
    resetPasswordExpires: Date
});

userSchema.method('makeAdmin', async function () {
    this.role = 'Admin';
    await this.save();
});

userSchema.method('markFormCompleted', async function () {
    this.completedForm = true;
    await this.save();
    const msg = await ejs.render('../private/completedForm',this);
    await sgMail.send(msg);
});

userSchema.method('markSetupCompleted', async function (attrs = {}) {
    this.completedSetup = true;
    await this.save();
    const userLocation = Location.findById(this.location);
    const bccs = await userLocation.sendContactEmails();
    const msg = {
        to:this.email,
        from:'Site Admin <info@greenstreetimagining.com>',
        bcc:bccs,
        subject:`${this.firstName} ${this.lastName} ${this.title} Setup Complete - ${userLocation.city} #${userLocation.officeNumber}`,
        text: ejs.render('../private/completedSetup', attrs)
    };
    await sgMail.send(msg);
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);