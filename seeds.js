const User = require('./models/user');
const Form = require('./models/form');
const Question = require('./models/question');
const faker = require('faker');

async function seedDatabase() {
    const adminCount = Math.round(Math.random() *30);
    const userCount = Math.round(Math.random() *600);

    for(let i = 0; i < adminCount; i++) {
        const numberOfContacts = Math.round(Math.random() *5);
        const createdAdmin = await User.create({
            firstname: faker.name.firstname(),
            lastname: faker.name.lastname(),
            username: `${this.firstname}${this.lastname}`,
            email:faker.internet.email(),
            role:'Admin',
            companyInfo: {
                officeNumber: Math.round(Math.random() * 1000),
                name: faker.company.companyName(),
                phone: faker.phone.phoneNumber(),
                fax: faker.phone.phoneNumber(),
                address: {
                    streetNumber: Math.round(Math.random() * 5000),
                    streetName: faker.address.streetName(),
                    city: faker.address.city(),
                    state: faker.address.stateAbbr(),
                    postal: faker.address.zipCode()
                },

            }
        });
        for(let i = 0; i < numberOfContacts; i++) {
            const contact = {
                email:faker.internet.email(),
                firstname: faker.name.firstname(),
                lastname: faker.name.lastname(),
                title: faker.name.jobTitle()
            }
            createdAdmin.contacts.push(contact);
            createdAdmin.save();
        }

    }
};

module.exports = seedDatabase;