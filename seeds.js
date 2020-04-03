const fs = require('fs');
const faker = require('faker');
const crypto = require('crypto');
const Company = require('./models/company');
const Location = require('./models/location');
const User = require('./models/user');
const Form = require('./models/form');
const Question = require('./models/question');
const Response = require('./models/response');

const sampleImages = fs.readdirSync('./public/images/seeds');

function flipACoin() {
    const yesOrNo = Math.floor(Math.random() *2);
    // console.log(yesOrNo);
    return yesOrNo;
}

async function pickADate() {
    return new Promise((resolve, reject) => {
        try {
            const today = new Date();
            const day = Math.ceil(Math.random() * 27);
            const thisOrLastYear = flipACoin();
            if(thisOrLastYear) {
                const month = Math.ceil(Math.random() * today.getMonth())
                const returnDate = new Date(today.getFullYear(),month,day);
                console.log(`Date from last year:`,returnDate);
                resolve(returnDate);
                return
            } else {
                const month = Math.ceil(Math.random() * 12);
                const returnDate = new Date(today.getFullYear() -1,month,day);
                console.log(`Date from this year:`,returnDate);
                resolve(returnDate);
                return
            }
        } catch (err) {
            console.log(`Error creating random date: ${err.message}`);
            reject(Date.now());
            return
        }
    });
};

async function seedDefaultQuestions() {
    try {
        console.log('clearing all default questions from database')
        await Question.deleteMany({});
    } catch (err) {
        console.log(err.message);
    }
    try {
        console.log('adding default questions to database')
        const defaultQuestionsJSON = await JSON.parse(await fs.readFileSync('./private/defaultQuestions.json'));
        for (let question of defaultQuestionsJSON) {
            // console.log(question);
            await Question.create(question);
        }
        console.log(`${defaultQuestionsJSON.length} default questions added to database`);
    } catch (err) {
        console.log(err.message);
    }
    
};


async function clearDatabase() {

    console.log('Clearing database \n Clearing Companies');
    await Company.deleteMany({});
    console.log('All Companies deleted \n Clearing Locations');
    await Location.deleteMany({});
    console.log('All Locations deleted \n Clearing Users');
    await User.deleteMany({role: {$ne:'owner'}});
    console.log('All Users deleted \n Clearing Forms');
    await Form.deleteMany({});
    console.log('All forms deleted \n Clearing responses');
    await Response.deleteMany({});
    console.log('Database cleared');
    
};


async function seedDatabase() {
    // const companyCount = Math.ceil(Math.random() * 200);
    const companyCount = 10;
    const defaultQuestions = await Question.find({isDefault:true});

    async function createLocations(companyId) {
        const locationCount = Math.ceil(Math.random() * 5);
        let locationsArr = [];
        for (let i = 0; i < locationCount; i++) {
            let isPrimary = false;
            if (i=== 0) {
                isPrimary = true;
            }
            const randomImageIndex = Math.ceil(Math.random() * sampleImages.length);
            const newLocation = await Location.create({
                primary: isPrimary,
                officeNumber: Math.ceil(Math.random() * 1000).toString(),
                name: faker.company.companyName(),
                phone: faker.phone.phoneNumber(),
                fax: faker.phone.phoneNumber(),
                address: {
                    streetNumber: Math.random(Math.ceil() * 1000),
                    streetName: faker.address.streetName(),
                    secondary: `Ste ${faker.random.alphaNumeric()}`,
                    city: faker.address.city(),
                    state: faker.address.stateAbbr(),
                    postal: faker.address.zipCode(),
                    country: 'USA'
                },
                website: faker.internet.url(),
                images: [
                    {
                        secure_url:`/images/seeds/${sampleImages[randomImageIndex]}`
                    }
                ],
                company: companyId,
                created: await pickADate()
            });
            await newLocation.save();
            newLocation.contacts = await createUsers(newLocation._id, companyId, 'Admin', (Math.ceil(Math.random() * 5)));
            await newLocation.save();
            console.log(`Location ${newLocation.name} created with ${newLocation.contacts.length} contacts`)
            await createUsers(newLocation._id, companyId, 'User', (Math.ceil(Math.random() * 30)));
            locationsArr.push(newLocation._id);
            await newLocation.addDefaultForm();
        }
        return locationsArr;
    };

    async function createUsers(locationId, companyId, role, count) {
        let contactsArr = [];
        for (let i = 0; i < count; i++) {
            const newFirstName = await faker.name.firstName();
            const newLastName = await faker.name.lastName();
            let newUser;
            try {
                newUser = await User.register({
                firstname: newFirstName,
                lastname: newLastName,
                username: newFirstName+newLastName,
                personalEmail: newFirstName+newLastName+'@test.com',
                role: role,
                company: companyId,
                location: locationId,
                formAccessToken: crypto.randomBytes(16).toString('hex'),
                createAccountToken: crypto.randomBytes(16).toString('hex'),
                created: await pickADate()
            },'password');
        } catch (err) {
            if (err.message.includes('UserExistsError')) {
                continue;
            }
        }
        if(role === 'User');{
            if(flipACoin()) {
                newUser.responses.push(await createResponse(newUser)); 
                await newUser.save();
            } else {
                continue;
            }                
        };
        contactsArr.push(newUser._id);
        console.log(`${role} ${newUser.firstname} ${newUser.lastname} created`);
        };
        return contactsArr;
    };

    async function createResponse(user) {
        return new Promise(async (resolve, reject) => {
            console.log(`Creating a response for ${user.firstname}`)
            const makeString = (charLimit) => {
                let str = faker.lorem.paragraph()
                    if (str.length > charLimit) {
                        str = str.slice(0, charLimit - 1)
                    }
                    return str
                }
            let response = await Response.create({owner:user._id, created:await pickADate()});
            try {
                for (let question of defaultQuestions) {
                    const answer = {
                        questionId: question._id
                    }
                    if(question.inputType == 'Checkbox') {
                        answer.value = true;
                    }
                    if(question.inputType == 'Email') {
                        answer.value = faker.internet.email();
                    }
                    if(question.inputType == 'File') {
                        continue;
                    }
                    if(question.inputType == 'Image') {
                        continue;
                    }
                    if(question.inputType == 'Number') {
                        answer.value = Math.ceil(Math.random() * 99);
                    }
                    if(question.inputType == 'Password') {
                        answer.value = 'Pa55w0rd123';
                    }
                    if(question.inputType == 'Radio') {
                        question.value = 'No';
                    }
                    if(question.inputType == 'Select') {
                        question.value = "At&t";
                    }
                    if(question.inputType == 'Tel') {
                        answer.value = faker.phone.phoneNumber();
                    }
                    if (question.inputType == 'Text') {
                        if(question.maxLength) {
                            answer.value = makeString(question.maxLength);
                        } else {
                            answer.value = faker.lorem.words()
                        }
                    }
                    if(question.inputType == 'Textarea') {
                        answer.value = faker.lorem.paragraph();
                    }
                    if(question.inputType == 'Url') {
                        answer.value = faker.internet.url();
                    }
                    response.answers.push(answer);
                }
                await response.save();
                resolve(response._id);
                return;
            } catch (err) {
                console.log(`Error creating random response: ${err.message}.`);
                reject(response);
                return;
            }
        });
    }

    console.log(`Creating ${companyCount} companies`)
    for(let i = 0; i < companyCount; i++) {
        const newCompany = await Company.create({
            name: faker.company.companyName(),
            created: await pickADate()
        });
        newCompany.locations = await createLocations(newCompany._id);
        await newCompany.save();
        console.log(`${newCompany.name} created with ${newCompany.locations.length} locations`)
    }
    console.log('database seeded')
};

module.exports = {seedDatabase, clearDatabase, seedDefaultQuestions};