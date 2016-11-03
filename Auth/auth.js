"use strict";


var mongoose = require('mongoose');
var User = mongoose.model('User');

var local = require('./passport/local');
var google = require('./passport/google');
var facebook = require('./passport/facebook');
var bearerAuth = require('./passport/bearerAuth');

module.exports = function (passport, config) {
  // serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user._id)
    })

    passport.deserializeUser(function(id, done) {
        User.load({ criteria: { _id: id } }, function (err, user) {
          done(err, user)
        })
    })

    // use these strategies
    passport.use('local', local);
    passport.use(google);
    passport.use(facebook);
    passport.use(bearerAuth);
};
