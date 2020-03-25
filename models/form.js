const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const version = require('mongoose-version');
const Question = require('./question');


const formSchema = new Schema({
    title: {
        type: String,
        default: 'Default Form'
    },
    questions: [
        {
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
                enum: inputTypes
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
        }
    ],
    created: {
        type: Date,
        default: Date.now()
    },
    lastEdited: {
        when: {
            type: Date,
            default: Date.now()
        },
        by: {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    }
});

formSchema.plugin(version,{collection:'form_versions'});

formSchema.method('addDefault', async function () {
    console.log('adding default questions to form')
    const defaultQuestions = await Question.find({isDefault:true}).sort('order');
    for (let question of defaultQuestions) {
        await this.questions.push(question._id);
    }
    await this.save()
});

formSchema.method('removeDefault',  async function () {
    const existingDefaultQuestions = await this.questions.find({isDefault:true});
    if(existingDefaultQuestions && existingDefaultQuestions.length > 0) {
        for(question of existingDefaultQuestions) {
            this.questions.splice(this.questions.indexOf(question),1);
        }
    }
    this.save();
});

// formSchema.post('init', async function () {
//     await this.addDefault();
// });

module.exports = mongoose.model('Form',formSchema);