
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var FacebookTokenStrategy = require('passport-facebook-token').Strategy;
var env = process.env.NODE_ENV || 'development';
var config = require('../../config')[env];
var functions = require('../../Utilities/utilities');
var User = mongoose.model('User');

module.exports = new FacebookTokenStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        profileURL: 'https://graph.facebook.com/me?fields=id,name,email'
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            if(profile) {
                var email, name = 'User', find = {facebookId: profile.id};

                if (profile._json) {
                    name = profile._json.name;
                    email = profile._json.email;
                    if (email != undefined) {
                        find = {$or:[ {facebookId:profile.id}, {'email':email}]}
                    }
                }

                User.findOne(find, function (err, user) {
                    if (err) {
                        return done(err);
                    } else if (!user) {
                        var username = name + '.' + ( "" + Math.random()).substring(2, 5);
                        var newUser = {
                            'name':name,
                            'gender':profile.gender,
                            'facebookId':profile.id,
                            'email' : email,
                            'emailVerification':true,
                            'profilePic':'http://graph.facebook.com/v2.2/' + profile.id + '/picture?redirect=true&type=large',
                            'username': username
                        };
                        var user = new User(newUser);
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
                return done(new Error('Facebook Profile not found'));
            }
        });
    }
);
