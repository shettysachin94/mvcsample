
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var BearerStrategy = require('passport-http-bearer').Strategy;
var env = process.env.NODE_ENV || 'development';
var config = require('../../config')[env];
var functions = require('../../Utilities/utilities');
var User = mongoose.model('User');
var AccessToken = mongoose.model('AccessToken');


module.exports = new BearerStrategy(
    function (accessToken, done) {
        console.log("accessToken :",accessToken);
        AccessToken.findOne({ token: accessToken }, function (err, token) {
            console.log("err:",err);
            console.log("token:",JSON.stringify(token));
            if (err) { return done(err); }
            if (!token) { 
                return done(null, false, { message: 'Token expired' });
            } else {
                if (Math.round((Date.now() - token.created) / 1000) > config.security.tokenLife) {
                    AccessToken.remove({ token: accessToken }, function (err) {
                        if (err) {
                            return done(err);
                        }
                    });
                    return done(null, false, { message: 'Token expired' });
                }

                User.findById(token.userId, function (err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, { message: 'Unknown user' }); }

                    var info = { scope: '*' };
                    done(null, user, info, accessToken);
                });
            }
        });
    }
);
