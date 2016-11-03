
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var env = process.env.NODE_ENV || 'development';
var config = require('../../config')[env];
var functions = require('../../Utilities/utilities');
var User = mongoose.model('User');

module.exports = new GoogleTokenStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            if(profile) {
                var email, name, find = {googleId: profile.id};
                if (profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value;
                    if (email != undefined) {
                        find = {$or:[ {'email':email},{googleId: profile.id}]};
                    };
                }

                if (profile.name) {
                    if (profile.name.givenName && profile.name.familyName) {
                        name = profile.name.givenName + ' ' + profile.name.familyName;
                    } else if (profile.name.familyName) {
                        name = profile.name.familyName;
                    } else if(profile.name.givenName) {
                        name = profile.name.givenName;
                    }
                }
                User.findOne(find, function (err, user) {
                    if (err) {
                        return done(err);
                    } else if (!user) {
                        var username = ''
                        if (name) {
                            if (profile.name.givenName &&  profile.name.familyName) {
                                username = profile.name.givenName + '.' + profile.name.familyName;
                            } else {
                                username = name;
                            }
                        }
                        
                        username += '.' + ( "" + Math.random()).substring(2, 5);

                        var newUser = {
                            'name':name,
                            'googleId':profile.id,
                            'emailVerification':true,
                            'email' : email,
                            'profilePic': profile._json.picture,
                            'username': username
                        };
                        var user = new User(newUser);
                        user.createdTimestamp = new Date();
                        user.firstLogin = false;
                        user.save(function (err, user) {
                            if(!err && user) {
                                var username = user.name;
                                console.log('username:',username);
                                if (username === undefined || username == '') {
                                    username = "User";
                                }

                                var retUser = user.toObject();
                                retUser.firstLogin = true;
                                return done(null, retUser);
                            } else {
                                return done(err);
                            }
                        });
                    } else {
                        return done(null, user);
                    }
                });
            } else {
                return done(new Error('Google Profile not found'));
            }
        });
    }
);
