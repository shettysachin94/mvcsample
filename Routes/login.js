/**
 * Project          : DingChak
 * Module           : Login
 * Source filename  : login.js
 * Description      : Api's related to login
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */

var mongoose = require('mongoose');
var passport = require('passport');

module.exports = function (server, config, functions) {

	var URLPrefix = config.URLPrefix;

    /**
     * @api {post} /auth/email/login Email login
     * @apiVersion 0.0.1
     * @apiName emailLogin
     * @apiGroup Login
     *
     * @apiDescription Login via email address.
     *
     * @apiParam {String} email The email.
     * @apiParam {String} password The password.
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *     {
     *         "meta": {
     *             "code": 0,
     *             "currentDate": "2015-11-04T11:42:26.976Z"
     *         },
     *         "pagination": {},
     *         "data": {
     *             "accessToken": "cSDUbPIr6Q0DIWTGDNWrco/dECYSX5EBWwXFqY54WME=",
     *             "refreshToken": "5wvQkaTZGdNQb/Yw6Z6mxVxKwVBG7KqQAt66KXWYg7Q=",
     *             "expires": 3600,
     *             "user": {
     *                 "_id": "56389ee4d29a716b0d000003",
     *                 "email": "lloyd.presly@robosoftin.com",
     *                 "hashedPassword": "d1df11bc2846c413b2ebfc7661c85e064ee2de18",
     *                 "salt": "bze/++30S/wCsmcHYiTx3u93jEkNQIwP333LLtg/6IA=",
     *                 "name": "lloyd",
     *                 "createdTimestamp": "2015-11-03T11:47:48.839Z"
     *             }
     *         }
     *     }
     *
     * @apiUse ParameterMissingError
     *
     * @apiUse DatabaseFailureError
     *
     */

    server.post(URLPrefix + '/auth/email/login', function (req, res, next) {
        functions.checkRequired(req, res, ['email', "password"],
            function (err) {
                if (!err) {
                    passport.authenticate('local', function (err, user, info) {
                        console.log('INFO', info);
                        if (err) {
                            return next(err);
                        }
                        if (info) {
                            if (info.message === 'invalidEmail') {
                                return functions.notifyError(res, 'invalidEmailError', 2001, 403, 'Please enter a valid email ID.');
                            }
                            if (info.message === 'invalidNumber') {
                                return functions.notifyError(res, 'LOGIN FAILED', 2001, 403, 'Sorry! This mobile no. is not registered with us. Tap sign up to create a new account.');
                            }
                            if (info.message === 'notVerified') {
                                return functions.notifyError(res, 'notVerifiedError', 2002, 403, "A verification link has been sent to your email ID. If you don’t receive the email, check ‘spam’ or click ‘Resend'.");
                            }
                            if (info.message === 'invalidPassword') {
                                return functions.notifyError(res, 'invalidPasswordError', 2001, 403, 'Please enter a valid password.');
                            }
                        }
                        if (!user) {
                            return functions.notifyError(res, functions.getLocalizedString('kNotAuthorizedError', req.headers.languageprefered), 2001, 403, functions.getLocalizedString('kUnAuthorized', req.headers.languageprefered));
                        }
                        var modelData = {
                            user: user
                        };

                        functions.generateTokens(modelData, function (err, tokenValue, refreshTokenValue, expires) {
                            if (!err) {

                                functions.sendData(res, {
                                    'accessToken': tokenValue,
                                    'refreshToken': refreshTokenValue,
                                    'expires': expires.expires_in,
                                    'user': user
                                });
                            } else {
                                return functions.notifyError(res, functions.getLocalizedString('kDatabaseFailure', req.headers.languageprefered), 5001, 500, functions.getLocalizedString('kGenerateTokensError', req.headers.languageprefered));
                            }
                        });
                    })(req, res, next);
                }
            }
        );
    });
};