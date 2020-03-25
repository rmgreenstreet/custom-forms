const User = require('../models/user');

const middleware = {
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
			Promise.resolve(fn(req, res, next))
						 .catch(next);
    },
	/* see if a user is logged in before allowing user-only actions */
	async isLoggedIn (req,res,next) {
		if(req.isAuthenticated()) return next();
		req.session.error = 'You need to be logged in to do that!';
		req.session.redirectTo = req.originalUrl;
		res.redirect('/login');
    },
	/* before changing the password in the profile edit form, 
	make sure the old password provided is correct */
	async isValidPassword (req,res,next) {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
		if(user){
			console.log('found user');
			//add user to res.locals
			res.locals.user = user
			next();
		}
		else {
			console.log('no user found');
			middleware.deleteProfileImage(req);
			req.session.error = "Incorrect current password!";
			return res.redirect('/profile');
		}
	},
	/*  */
	async changePassword (req,res,next) {
		const {
			newPassword,
			passwordConfirmation,
		} = req.body;
		/* if user entered a new password, but left the confirmation blank, let them know */
		if(newPassword && !passwordConfirmation) {
			req.session.error = 'Missing password confirmation!';
			middleware.deleteProfileImage(req);
			return res.redirect('/profile');
		}
		/* if a new password was entered, change it in the user's document */
		else if(newPassword && passwordConfirmation) {
			console.log('user wants to change password')
			const { user } = res.locals;
			// make sure new password and confirmation match
			if(newPassword === passwordConfirmation) {
				console.log('passwords match');
				//if they match, set the new password
				await user.setPassword(newPassword);
				next();
			} else {
				console.log('passwords do not match');
				// middleware.deleteProfileImage(req); /* not sure why I left this here */
				req.session.error = "New passwords do not match!"
				return res.redirect('/profile');
			}
		} else {
			next();
		}
	},
	async deleteProfileImage (req,res,next) {
		if (req.file) {	
			await cloudinary.uploader.destroy(req.file.public_id);
		}
	},
	async isAdmin (req, res, next) {
		if (req.user.role === 'Admin' || req.user.role === 'Owner') {
			next();
		} else {
			req.session.error = 'You are not authorized to access this page';
			res.redirect('back');
		}
	},
	async isOwner(req, res, next) {
		if (req.user.role === 'Owner') {
			next();
		} else {
			req.session.error = 'You are not authorized to access this page';
			res.redirect('back');
		}
	}
};

module.exports = middleware;