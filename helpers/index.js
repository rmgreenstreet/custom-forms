const User = require('../models/user');

module.exports = {
    async newUserErrorHandler (err, newUser, res) {
    console.log(err);
    console.log('Deleting created user to try again');
    await User.findByIdAndDelete(newUser._id);
    return res.redirect('/users/dashboard');
    }
};
