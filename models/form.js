const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const version = require('mongoose-version');
const Question = require('./question');
const inputTypes = require('./inputTypes');


const formSchema = new Schema({
    title: {
        type: String,
        default: 'Default Form'
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        }
    ],
    created: {
        type: Date,
        default: new Date()
    },
    lastEdited: {
        when: {
            type: Date,
            default: new Date()
        },
        by: {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    }
});

// formSchema.plugin(version,{collection:'form_versions'});

formSchema.method('addDefault', async function () {
    console.log('adding default questions to form')
    const defaultQuestions = await Question.find({isDefault:true}).sort('order');
    for (let question of defaultQuestions) {
        this.questions.push(question._id);
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

formSchema.queue('addDefault',[]);

// formSchema.post('init', async function () {
//     await this.addDefault();
// });

module.exports = mongoose.model('Form',formSchema);