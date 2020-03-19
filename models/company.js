const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    locations: {
        required:true,
        type: [
            {
                primary: {
                    type:Boolean,
                    default:true
                },
                officeNumber:{
                    type:String,
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
                    required:true
                },
                address: {
                    required: true,
                    type: {
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
                            minlength:2,
                            required:true
                        },
                        postal: {
                            type:String,
                            minlength:5,
                            maxlength:7,
                            required:true
                        }
                    }
                },
                website: {
                    type: Schema.Types.Url,
                    required:true
                },
                images: {
                    required:true,
                    type: [
                        {
                            secure_url: Schema.Types.Url,
                            public_id: String
                        }
                    ]
                },
                contacts: [
                    {
                        type:Schema.Types.ObjectId,
                        ref: 'User'
                    }
                ],
                forms: [
                    {
                        type:Schema.Types.ObjectId,
                    }
                ]
            }
        ]
    },
    
});

companySchema.post('init', async function () {
    const defaultForm = await Form.create()
    this.forms.push(defaultForm.id);
    await this.save();
    // if(this.role === 'Admin') {
    //     const defaultForm = await Form.create({
    //         lastEdited: {
    //             when: Date.now(),
    //             by: this.id
    //         }
    //     });
    //     this.forms.push(defaultForm.id);
    //     this.save();
    // } else {
    //     return
    // }
});

module.exports = module.exports = mongoose.model('Company', companySchema);