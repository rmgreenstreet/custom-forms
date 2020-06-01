const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const version = require('mongoose-version');
const Question = require('./question');


const formSchema = new Schema({
    title: {
        type: String,
        default: 'Default Form'
    },
    sections: [
        {
            title: String,
            questions: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Question'
                }
            ],
            order: Number
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
    const defaultQuestions = await Question.find({isDefault:true});
    for (let question of defaultQuestions) {
        const currentSection = this.sections.find(section => section.title === question.sectionTitle)
        if (typeof currentSection !== 'undefined') {
            console.log(`Adding question to existing section ${currentSection.title}`);
            currentSection.questions.push(question._id);
        } else {
            console.log(`Adding question to new section ${question.sectionTitle}`);
            this.sections.push({title: question.sectionTitle, questions: [question._id]})
        }
    }
    for (let section of this.sections) {
        section.order = this.sections.indexOf(section);
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

// formSchema.queue('addDefault',[]);

// formSchema.post('init', async function () {
//     await this.addDefault();
// });

module.exports = mongoose.model('Form',formSchema);