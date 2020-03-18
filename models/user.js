const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

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
    companyInfo: {
        officeNumber:{
            type:Number,
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
            required:false
        },
        address: {
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
                required:true,
                minlength:2
            },
            postal: {
                type:String,
                required:true,
                minlength:5,
                maxlength:7
            }
        },
        contacts: [
            {
                email:{
                    type:String,
                    unique:true,
                    required:true
                },
                firstName:{
                    type:String,
                    required:true
                },
                lastName:{
                    type:String,
                    required:true
                },
                title:{
                    type:String,
                    required:true
                }
            }
        ]
    },
    image: {
        url: {
            type:String,
            default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        },
        public_id: String
    },
    forms: [
        {
            type:Schema.Types.ObjectId,
        }
    ],
    role:{
        type:String,
        default:'User'
    },
    token:String,
    completedForm:{
        type:Boolean,
        default:false
    },
    completedSetup:{
        type:Boolean,
        default:false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);