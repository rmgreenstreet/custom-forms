const User = require('../models/user');

module.exports = {
    async routeByRole(req, res, next) {
        console.log('getting dashboard');
        const user = await User.findById(req.user._id);
        console.log(user);
        if(!user) {
          req.session.error = "User could not be found"
          return res.redirect('/')
        }
        if(user.role === 'Owner') {
          res.render('../views/owner/dashboard', {user});
        } else if (user.role === 'Admin') {
          console.log('this is an admin, getting dashboard for this location');
          try {
            const recentInvitations = await (await User.find({location:req.user.location}).limit(10));
            console.log(recentInvitations);
            res.render('../views/admin/dashboard', {user, recentInvitations});
          } catch (err) {
            req.session.error('Unable to find recent statistics');
          }
        } else if (user.role === 'User') {
          res.render('../views/user/dashboard', {user});
        } else {
          req.session.error = "User could not be found"
          res.redirect('/')
        }
    }
};