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

async function seedDefaultQuestions() {
    try {
        console.log('clearing all default questions from database')
        await Question.deleteMany({isDefault:true});
    } catch (err) {
        console.log(err.message);
    }
    try {
        console.log('adding default questions to database')
        const defaultQuestions = await JSON.parse(await fs.readFileSync('./private/defaultQuestions.json'));
        for (let question of defaultQuestions) {
            // console.log(question);
            await Question.create(question);
        }
        console.log(`${defaultQuestions.length} default questions added to database`);
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
    await User.deleteMany({firstname:!'potato'});
    console.log('All Users deleted \n Clearing Forms');
    await Form.deleteMany({});
    console.log('All forms deleted \n Clearing responses');
    await Response.deleteMany({});
    console.log('Database cleared');
    
};


async function seedDatabase() {
    const companyCount = Math.ceil(Math.random() * 200);

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
                officeNumber: Math.random(Math.ceil() * 1000).toString(),
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
                company: companyId
            });
            newLocation.contacts = await createUsers(newLocation._id, companyId, 'Admin', (Math.ceil(Math.random() * 5)));
            await newLocation.save();
            console.log(`Location ${newLocation.name} created with ${newLocation.contacts.length} contacts`)
            await createUsers(newLocation._id, companyId, 'User', (Math.ceil(Math.random() * 30)));
            locationsArr.push(newLocation);
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
                formAccessToken: crypto.randomBytes(16).toString(),
                createAccountToken: crypto.randomBytes(16).toString()
            },'password');
        } catch (err) {
            if (err.message.includes('UserExistsError')) {
                continue;
            }
        }
            if(role === 'User');{
                newUser.responses.push(await createResponse(newUser, locationId, companyId)); 
                await newUser.save();
            };
            contactsArr.push(newUser._id);
            console.log(`${role} ${newUser.firstname} ${newUser.lastname} created`);
        };
        return contactsArr;
    };

    async function createResponse(user, locationId, companyId, role) {
        let response;
    }

    console.log(`Creating ${companyCount} companies`)
    for(let i = 0; i < companyCount; i++) {
        const newCompany = await Company.create({
            name: faker.company.companyName()
        });
        newCompany.locations = await createLocations(newCompany._id);
        console.log(`${newCompany.name} created with ${newCompany.locations.length} locations`)
    }
    console.log('database seeded')
};

module.exports = {seedDatabase, clearDatabase, seedDefaultQuestions};