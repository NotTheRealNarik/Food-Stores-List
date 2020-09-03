const passport = require('passport');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'You are logged in'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('successfully logged out')
    res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
    //check if user is authenticated
    if (req.isAuthenticated()){
        next(); // carry on. they are logged in
        return;
    }
    req.flash('error', 'Must be logged in to add stores')
    res.redirect('/login');
};