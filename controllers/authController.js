const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User')
//const User = require('../models/User');
const crypto = require('crypto');
const promisify = require('es6-promisify');


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

exports.forgot = async (req, res) => {
    // 1.see if user exists with that email
    const user = await User.findOne({email:req.body.email});
    if(!user){
        req.flash('error', 'No account with that email exists');
        return res.redirect('/login');
    }
    // 2. set reset tokens adn expiry on their accounr
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; //1hr
    await user.save();
    // 3. send email with the token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    req.flash('success', `Password link emailed. ${resetURL}`);
    // 4. redirect to login page
    res.redirect('/login');


}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user){
        req.flash('error', 'Password Reset Is invalid or Token has expired')
        return res.redirect('/login');
    }
    //if user does exist
    res.render('reset', {title:'Reset Password'});

}


exports.confirmPasswords = (req,res,next) =>{
    if(req.body.password === req.body['password-confirm']){
        next();
        return;
    }
    req.flash('error','Password does not match')
}

exports.update = async (req,res) =>{
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user){
        req.flash('error', 'Password Reset Is invalid or Token has expired');
        return res.redirect('/login');
    }
    //if user does exist, we update
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    //now auto login them
    await req.login(updatedUser); //calling login function from authController.js
    res.redirect('/') 

}