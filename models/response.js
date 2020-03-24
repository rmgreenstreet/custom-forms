const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    answers: [
        {
            questionID: {
                type: Schema.Types.ObjectId,
                ref: 'Question'
            },
            value:Schema.Types.Mixed
        }
    ]
});

module.exports = mongoose.model('Response', responseSchema);