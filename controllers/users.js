const User = require('../models/user');

module.exports = {
    async routeByRole(req, res, next) {
        console.log('getting dashboard');
        const user = await User.findById(req.user.id);
        if(!user) {
          req.session.error = "User could not be found"
          return res.redirect('/')
        }
        if(user.role === 'Owner') {
          res.render('../views/owner/dashboard', {user});
        } else if (user.role === 'Admin') {
          res.render('../views/admin/dashboard', {user});
        } else if (user.role === 'User') {
          res.render('../views/user/dashboard', {user});
        } else {
          req.session.error = "User could not be found"
          res.redirect('/')
        }
    }
};