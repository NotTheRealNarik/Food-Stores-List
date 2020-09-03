const mongoose = require('mongoose');
const User = mongoose.model("User");//get the User.js schema
const promisify = require('es6-promisify');



exports.loginForm = (req, res) => {
    res.render('login.pug', {title: 'login'})

}

exports.registerForm = (req, res) => {
    res.render('register.pug', {title: 'Register'})

}

exports.validateRegister = (req, res, next) =>{ // we pass next since it is a middleware
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a Name').notEmpty();
    req.checkBody('email', 'That email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Confirmed password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Password does not match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors){
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash()});
        return;
    }
    next() // if no errors this is called, which will move forward to registering in db
};


exports.validateLogin = async (req, res, next) => {
    req.checkBody('email', 'That email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'password cannot be blank').notEmpty();
    const validEmail = await User.findOne({email: req.body.email});
    if (!validEmail){
        req.flash('error', 'Email does not exist');

    }
    const errors = req.validationErrors();
    if (errors){
        req.flash('error', errors.map(err => err.msg));
        res.render('login.pug', {title: 'Login', body: req.body, flashes: req.flash()});
        return;
    }
    next() // if no errors this is called, which will move forward to registering in db


};


exports.register = async (req, res, next)=>{ // we pass next becasue it is a middleware
    //storing in mongoDB
    const user = new User({
        email: req.body.email,
        name: req.body.name
    })
    const register = promisify(User.register, User); //this .register method is from mongodb passportLocalMongoose
    //promisify() second arg: if the method you are trinyg to promisify (User.register) lives on an object, we need to pass the object as the second arg
    await register(user, req.body.password);
    next()
};


exports.account = (req, res) =>{
    res.render('account.pug', {title:'Edit Your Account'});

};

exports.updateAccount = async (req,res) =>{
    const update = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findOneAndUpdate(
        { _id: req.user._id }, //quesry from database
        { $set: update }, //update from updates variable
        { new: true, runValidators: true, context: 'query'} //options

    );
    res.redirect('/account');
};





