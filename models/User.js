const mongoose= require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true, // removes spaces
        validate: [validator.isEmail, 'Invalid Email Address'], // checks if email is valid by using validator node package
        required: 'Please Supply an Email Address'

    },

    name: {
        type: String,
        required: 'Please supply a Name',
        trim: true
    }
});

userSchema.virtual('gravatar').get(function(){
    const hash = md5(this.email);
    return `https://gravatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler); //used to handle errors from "validate" and "unique"

module.exports = mongoose.model('User',userSchema);