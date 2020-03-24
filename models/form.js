const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const version = require('mongoose-version');
const Question = require('./question');


const formSchema = new Schema({
    questions: [
        {
            type:Schema.Types.ObjectId,
            ref: 'Question',
        }
    ],
    created: {
        type: Date,
        default: Date.now()
    },
    lastEdited: {
        when: Date,
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

formSchema.post('init', async function () {
    await this.addDefault();
});

module.exports = mongoose.model('Form',formSchema);