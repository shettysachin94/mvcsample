/**
 * Project          : DingChak
 * Module           : User
 * Source filename  : User.js
 * Description      : Api's related to users
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */


"use strict"

var mongoose = require('mongoose');
var async = require('async');
var User = mongoose.model('User');
var AccessToken = mongoose.model('AccessToken');
var RefreshToken = mongoose.model('RefreshToken');
var passport = require('passport');

var _ = require('lodash');

module.exports = function(server, config, functions) {
    var URLPrefix = config.URLPrefix
    console.log("URLPrefix:",URLPrefix);

    /**
     * @api {post} /users Create a user
     * @apiVersion 0.0.1
     * @apiName createUser
     * @apiGroup Users
     *
     * @apiDescription Signup with Facebook and Gooole Plus will also login the user. However, signup with email will require the user to verify his email and login manually. Password length should be 6 - 25 characters, should contain digit, lower-case and upper-case character. For time being verification is not implemented.
     *
     * @apiParam {String} email The unique identifier (not required if facebookId or googleId is present).
     * @apiParam {String} name The name of the user.
     * @apiParam {String} password The password of the user.
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *
     *     {
     *      "meta": {
     *          "code": 0,
     *          "currentDate": "2015-07-21T10:33:20.126Z"
     *      },
     *      "pagination": {},
     *      "data": {
     *          "_id": "55ae1ff04c5321d807000002",
     *          "name": "Lloyd Saldanha",
     *          "email": "lloyd.presly@gmail.com",
     *      }
     *  }
     *
     * @apiUse ParameterMissingError
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse DuplicateRecordError
     *
     * @apiUse InvalidParameterError
     */

    server.post(URLPrefix + '/users', function(req, res) {
        functions.checkRequired(req, res, ['name', 'password', 'email'],
            function(err) {
                if (!err) {
                    var validPassword = User.validatePassword(req.body.password)

                    var user = new User(req.body)
                    user.username = (req.body.username !== undefined) ? req.body.username : user.name.toLowerCase() + '.' + ("" + Math.random()).substring(2, 5)
                    async.forEach(Object.keys(user), function(key, callback) {
                        if (user[key] === undefined) {
                            delete user[key]
                        }
                        callback()
                    }, function(err) {
                        if (err) {
                            return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
                        }
                        user.emailVerification = true;
                        user.save(function(err, user) {
                            if (err) {
                                if ((err.code === 11000 || err.code === 11001) && err.message.match(/email/)) {
                                    functions.notifyError(res, 'Duplicate', 1010, 400, 'EmailExists')
                                }
                                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message);
                            }

                            return functions.sendData(res, user);
                        })
                    })
                }
            }
        )
    });

 
    /**
     * @api {get} /users Get all users
     * @apiVersion 0.0.1
     * @apiName listUsers
     * @apiGroup Users
     *
     * @apiDescription List all users, unverified users who signedup using email are not listed. To retrieve selected fields use '?fields=<field1, field2>'. For example, /users?fields=name,email . The Authorization key in header should contain value "Bearer [Access_Token]".
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *     {
     *           "meta": {
     *               "code": 0,
     *               "currentDate": "2015-07-21T10:44:45.976Z"
     *           },
     *           "pagination": {},
     *           "totalCount": 2,
     *           "count": 2,
     *           "data": [
     *               {
     *                   "_id": "55ae1ff04c5321d807000002",
     *                   "name": "Lloyd Saldanha"
     *               },
     *               {
     *                   "_id": "55ae1ff04c5321d807000034",
     *                   "name": "Sample"
     *               }
     *           ]
     *       }
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     */

    server.get(URLPrefix + '/users',  functions.ensureAuthenticated, function(req, res) {
        if (!req.user) {
            return functions.notifyError(res, 'UnAuthorized', 2001, 403, 'UserNotLoggedIn');
        }
        var selectFields = 'name username profilePic'
        var fields = Object.keys(req.query).length ? '' : selectFields
        fields = (req.query.fields !== undefined) ? req.query.fields.replace(/,/g, ' ') : fields
        var query

        var find = {}
        var populate;
        
        if (req.user.isAdmin) {
            if (req.query.search !== undefined) {
                find.$text = {
                    $search: req.query.search
                }
                fields = selectFields
            }
        }
        if (populate !== undefined) {
            query = User.find(find).select(fields).populate(populate).limit(req.query.limit).skip(req.query.skip)
        } else {
            query = User.find(find).select(fields).limit(req.query.limit).skip(req.query.skip)
        }

        var countQuery = User.count(find)
        Object.keys(req.query).forEach(function(key) {
            if (key !== 'limit' && key !== 'skip' && key !== 'fields' && key !== 'search') {
                query.where(key).regex(new RegExp(req.query[key], 'i'))
                countQuery.where(key).regex(new RegExp(req.query[key], 'i'))
            }
        })
        query.exec(function(err, users) {
            if (err) {
                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
            }
            if (!users.length) {
                return functions.notifyError(res, 'NoRecords', 1006, 404, 'NoUser')
            } else {
                countQuery.exec(function(err, totalCount) {
                    if (err) {
                        return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
                    }
                    return functions.sendData(res, users, undefined, undefined, undefined, undefined, users.length, totalCount)
                })
            }
        })
    })

    /**
     * @api {get} /users/:userId Get user details
     * @apiVersion 0.0.1
     * @apiName getUserDetails
     * @apiGroup Users
     *
     * @apiDescription Retrieve details of a user. The Authorization key in header should contain value "Bearer [Access_Token]".
     *
     * @apiSuccess Successful The request was processed successfully.
     *
     * @apiSuccessExample Response:
     *  HTTP/1.1 200 OK
     *  {
     *       "meta": {
     *           "code": 0,
     *           "currentDate": "2015-07-21T10:48:21.205Z"
     *       },
     *       "pagination": {},
     *       "data": {
     *           "_id": "55ae1ff04c5321d807000002",
     *           "username": "sir.lloyd saldanha.259",
     *           "name": "Sir Lloyd Saldanha",
     *           "email": "lloyd@saregam.com",
     *           "subscribed": false,
     *           "downloads": [],
     *           "favorites": [],
     *           "deviceInfo": [
     *               {
     *                   "name": "iPhone 6S Plus",
     *                   "linked": true,
     *                   "deviceId": "5f0070000045ae212fba270c",
     *                   "_id": "55ae212fba270cf007000004"
     *               }
     *           ]
     *       }
     *   }
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     */

    server.get(URLPrefix + '/users/:userId', functions.ensureAuthenticated, function(req, res) {
        if ((req.user && (req.user._id.toString() == req.params.userId.toString())) || (req.user && req.user.isAdmin)) {
            var excludeFields = '-__v -hashedPassword -salt -verificationCode -emailVerification -firstLogin -favorites'
            var fields = (req.query.fields !== undefined) ? req.query.fields.replace(/,/g, ' ') : excludeFields
            User.findById(req.params.userId).select(fields).exec(function(err, user) {
                if (err) {
                    return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
                } else if (!user) {
                    return functions.notifyError(res, 'NoRecords', 1006, 404, 'The user not found')
                } else {
                    return functions.sendData(res, user)
                }
            })
        } else {
            return functions.notifyError(res, 'UnAuthorized', 2001, 403, 'UserDetailsViewUnauthorized')
        }
    })

    /**
     * @api {put} /users/:userId Update user details
     * @apiVersion 0.0.1
     * @apiName updateUser
     * @apiGroup Users
     *
     * @apiDescription Update details of a user. The Authorization key in header should contain value "Bearer [Access_Token]".
     *
     * @apiSuccessExample Response:
     *  HTTP/1.1 200 OK
     *  {
     *       "meta": {
     *           "code": 0,
     *           "currentDate": "2015-07-21T10:48:21.205Z"
     *       },
     *       "pagination": {},
     *       "data": {
     *           "_id": "55ae1ff04c5321d807000002",
     *           "name": "Lloyd Saldanha",
     *           "email": "lloyd.presly@gmail.com"
     *       }
     *   }
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     */

    server.put(URLPrefix + '/users/:userId', functions.ensureAuthenticated, function(req, res) {
        if (!req.user) {
            return functions.notifyError(res, 'UnAuthorized', 2001, 403, 'UserNotLoggedIn')
        }
        if ((req.params.userId != req.user._id.toString()) && !req.user.isAdmin) {
            return functions.notifyError(res, 'UnAuthorized', 2001, 403, 'UserUpdateUnauthorized')
        }
        var update = {}
        if (req.body.password) {
            var validPassword = User.validatePassword(req.body.password)
            if (!validPassword) {
                return functions.notifyError(res, 'InvalidParameterError', 1010, 400, 'PasswordMinLenght')
            }
            update.password = req.body.password
        }
        if (req.body.name) {
            update.name = req.body.name;
        }
        if (req.body.phone) {
            update.phone = req.body.phone;
        }
        if (req.body.languagePrefered) {
            update.languagePrefered = req.body.languagePrefered;
        }
        if (req.body.city) {
            update.city = req.body.city;
        }

        var options = {new:true}

        var excludeFields = '-__v -hashedPassword -salt -verificationCode -emailVerification -firstLogin -favorites'
        User.findByIdAndUpdate(req.params.userId, update, options).select(excludeFields).exec(function (err, userData) {
            if (err) {
                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
            } else if (!userData) {
                return functions.notifyError(res, 'NoRecords', 1006, 404, 'The user not found')
            } else {
                return functions.sendData(res, userData);
            }
        })
    })

    /**
     * @api {delete} /users/:userId Delete a user
     * @apiVersion 0.0.1
     * @apiName deleteUser
     * @apiGroup Users
     *
     * @apiDescription Deletes a user. The Authorization key in header should contain value "Bearer [Access_Token]". Only admin can delete users.
     *
     * @apiSuccessExample Response:
     *  HTTP/1.1 200 OK
     *  {
     *       "meta": {
     *           "code": 0,
     *           "currentDate": "2015-07-21T10:48:21.205Z"
     *       },
     *       "pagination": {},
     *       "data": {
     *           "_id": "55ae1ff04c5321d807000002",
     *           "name": "Lloyd Saldanha",
     *           "email": "lloyd.presly@gmail.com"
     *       }
     *   }
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     *
     */

    server.delete(URLPrefix + '/users/:userId', functions.ensureAuthenticated, function(req, res) {
        if (!req.user) {
            return functions.notifyError(res, 'UnAuthorized', 2001, 403, 'UserNotLoggedIn')
        }
        if (!req.user.isAdmin) {
            return functions.notifyError(res, 'UnAuthorized', 2001, 403, 'UserDeleteUnauthorized')
        }
        var excludeFields = '-__v -hashedPassword -salt -verificationCode -emailVerification -firstLogin -favorites'
        User.findById(req.params.userId).select(excludeFields).exec(function(err, user) {
            if (err) {
                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
            } else if (!user) {
                return functions.notifyError(res, 'NoRecords', 1006, 404, 'The user was not found.')
            } else {
                var deletedUser = user.toObject()
                user.remove(function(err, user) {
                    if (err) {
                        return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
                    } else {
                        functions.sendData(res, deletedUser)
                    }
                })
            }
        })
    });

}
