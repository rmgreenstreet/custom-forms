const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    answers: [
        {
            questionId: {
                type: Schema.Types.ObjectId,
                ref: 'Question'
            },
            value:Schema.Types.Mixed
        }
    ],
    created: {
        type: Date,
        default: Date.now()
    },
    owner: Schema.Types.ObjectId
});

module.exports = mongoose.model('Response', responseSchema);