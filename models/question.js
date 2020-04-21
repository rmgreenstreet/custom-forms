const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const inputTypes = require('./inputTypes');
const htmlInputTypes = [];

inputTypes.forEach(type => {
    htmlInputTypes.push(type.htmlInputType);
});

const questionSchema = new Schema ({
    sectionName: {
        type:String,
        required:false
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    inputName:{
        type:String,
        required:true
    },
    elementId: {
        type: String,
        required: true,
        unique:true
    },
    inputType: {
        type: String,
        required: true,
        enum: htmlInputTypes
    },
    values: [],
    placeholder:String,
    isRequired: {
        type: Boolean,
        default: true
    },
    notes: String,
    minLength:Number,
    maxLength:Number,
    hasFollowUp: {
        type:Boolean,
        default:false
    },
    followUpQuestions: [Schema.Types.ObjectId],
    isFollowUp: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        required:true
    }
});

module.exports = mongoose.model('Question', questionSchema);