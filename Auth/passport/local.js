
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var env = process.env.NODE_ENV || 'development';
var config = require('../../config')[env];
var functions = require('../../Utilities/utilities');
var User = mongoose.model('User');

module.exports = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, done) {
        process.nextTick(function () {
            var isPhoneNumber = /^\d+$/.test(email);
            var query = {email: email.toLowerCase()};
            if(isPhoneNumber) {
                query = { $or: [ { phone: email }, { phoneWithCode: email } ] }
            }
            User.findOne(query, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    if(isPhoneNumber) {
                        return done(null, false, {message: 'invalidNumber'});
                    } else {
                        return done(null, false, {message: 'invalidEmail'});
                    }
                }
                if (!user.checkPassword(password)) {
                    return done(null, false, {message: 'invalidPassword'});
                }
                if (!user.emailVerification) {
                    return done(null, false, {message: 'notVerified'});
                }
                return done(null, user);
            });
        });
    }
);
