/**
 * Project          : DingChak
 * Module           : Utility
 * Source filename  : utilities.js
 * Description      : Common functions.
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014,
 *                    Written under contract by DingChak.
 */

"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var passport = require('passport');
var async = require('async');


var parser = require('../ExcelParser/lib/excel-parser');
var settings = require('../ExcelParser/Config/config').settings;

var path = require('path');

var fs = require('fs');
var crypto = require('crypto');


var path = require('path');
var mkdirp = require('mkdirp');
var geoip = require('geoip-lite-country');
var http = require('http');
var url = require('url');
var formUrlencoded = require('form-urlencoded');

var moment = require('moment')

var crypto = require('crypto');
var User = mongoose.model('User');
var AccessToken = mongoose.model('AccessToken');
var RefreshToken = mongoose.model('RefreshToken');


var countryCodes = require('../CountryCodes/countryCodes.json');
var _ = require("lodash")


var errFn = function(cb, err) {
    if (err) {
        return cb(err);
    }
};

module.exports = {
    //ensure auth
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        passport.authenticate('bearer', {
            session: false
        }, function(err, user, info) {
            var self = this;
            if (err) {
                return module.exports.notifyError(res, 'NotAuthorized', 2001, 401, err);
            }
            if (!user) {
                if ((typeof info == 'string') && info.split('error_description=')[1]) {
                    var message = info.split('error_description=')[1].replace(/"/g, '');
                    if (message === 'Unknown user') {
                        next();
                    } else {
                        return module.exports.notifyError(res, 'LoginFailed', 2002, 403, info.split('error_description=')[1].replace(/"/g, ''));
                    }
                } else {
                    return next();
                }
            } else {
                req.user = user;
                return next();
            }
        })(req, res, next);
    },

    //Check Required Parameters
    checkRequired: function(req, res, params, cb) {
        async.each(params, function(param, callback) {
            if ((req.method == 'POST' || req.method == 'PUT') && typeof req.body[param] == 'undefined') {
                if (param != 'password') {
                    module.exports.notifyError(res, 'ParameterMissing', 1009, 400, 'Parameter `' + param + '\' missing in request');
                } else {
                    callback(new Error("ParameterMissingError"));
                }
            } else {
                callback();
            }
        }, function(err) {
            if (err) {
                return cb(err)
            } else {
                return cb(null)
            }
        });
    },

    // Generates a new access and refresh token
    generateTokens: function (data, done) {
        var refreshToken,
            refreshTokenValue,
            accessToken,
            accessTokenValue;

        var saveToken = function() {
            accessToken.save(function(err, accessToken) {
                if (err) { return done(err); }
                refreshToken.accessToken = accessToken.token;
                refreshToken.save(function (err) {
                    if (err) { return done(err); }
                    done(null, accessTokenValue, refreshTokenValue, { 'expires_in': config.security.tokenLife });
                });
            });
        };

        var modelData = {
          userId: data.user._id,
          osVersion: data.osVersion,
        };

        accessTokenValue = crypto.randomBytes(32).toString('base64');
        refreshTokenValue = crypto.randomBytes(32).toString('base64');

        modelData.token = accessTokenValue;
        accessToken = new AccessToken(modelData);

        modelData.token = refreshTokenValue;
        refreshToken = new RefreshToken(modelData);

        saveToken();
    },

    //Success message
    sendData: function (res, data, errorMessage, errorCode, httpStatus, debugMessage, count, totalCount, subscribed) {
        errorCode = (typeof errorCode === 'undefined') ? 0 : errorCode;
        httpStatus = (typeof httpStatus === 'undefined') ? 200 : httpStatus;

        res.status(httpStatus).json({
            meta: {
                code: errorCode,
                errorMessage: errorMessage,
                debugMessage: debugMessage,
                currentDate: new Date().toISOString()
            },
            pagination: {
                nextURL: undefined,
                previousURL: undefined
            },
            totalCount: totalCount,
            count: count,
            data: data
        });
    },
    //Function to Notify an error message
    notifyError: function (res, errorMessage, errorCode, httpStatus, debugMessage) {
        //console.log('Request Body : ',res.req.body)
        console.log('Error Message : ', errorMessage);
        console.log('Debug Message : ', debugMessage);
        res
            .status(httpStatus)
            .json({
                meta: {
                    code: errorCode,
                    errorMessage: errorMessage,
                    debugMessage: debugMessage,
                    currentDate: new Date().toISOString()
                }
            });
    },
    
    randomString: function(len) {
        var buf = [],
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            charlen = chars.length;

        for (var i = 0; i < len; ++i) {
            buf.push(chars[this.getRandomInt(0, charlen - 1)]);
        }

        return buf.join('');
    },
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getIP : function(req) {
        if (req.headers['x-forwarded-for']) {
            return req.headers['x-forwarded-for'].split(',')[0];
        } else if (req.connection.remoteAddress) {
            return req.connection.remoteAddress;
        } else {
            return 'ip not found';
        }
    },
    getCountry: function(req) {
        var ip;
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0];
        } else if (req.connection.remoteAddress) {
            ip = req.connection.remoteAddress;
        } else {
            return ({
                countryName: 'India',
                countryCode: 'IN',
                phoneCode: "91"
            });
        }
        var geo = geoip.lookup(ip);
        var countryName;
        if (geo && geo.country) {
            var countryName, phoneCode;
            countryCodes.forEach(function(country, index) {
                if (country.iso2 == geo.country) {
                    countryName = country.countryName;
                    phoneCode = country.phoneCode;
                }
            })
            return ({
                countryName: countryName,
                countryCode: geo.country,
                phoneCode: phoneCode
            });
        } else {
            return ({
                countryName: 'India',
                countryCode: 'IN',
                phoneCode: "91"
            });
        }
    },
    shareContent: function(type, shareId, title, imageURL, desc, twitterDesc, cb) {
        fs.readFile(__dirname + '../HtmlTemplates/shareTemplate.html', 'utf8', function(err, html) {
            if (err) {
                return cb(err, null);
            }

            var scheme = 'com.dingchak.SampleApp://';
            var url;
            if (shareId) {
                url = scheme + type + '/' + shareId;
            } else {
                url = scheme + type;
            }
            var urlPath = '/share-redirect?url=' + encodeURIComponent(url);

            var thumbnail = imageURL;
            
            var replacements = {
                "%url%": urlPath,
                "%title%": title,
                "%image%": thumbnail,
                "%desc%": desc,
                "%twitterDesc%": twitterDesc,
            };
            html = html.replace(/%\w+%/g, function(all) {
                return replacements[all] || all;
            });

            return cb(null, html);
        });
    },
    request: function(requestUrl, options, data, cb) {
        options = options || {};

        var parsedUrl = url.parse(requestUrl);

        if (parsedUrl.hostname) {
            options.hostname = parsedUrl.hostname;
        }

        if (parsedUrl.port) {
            options.port = parsedUrl.port;
        }

        if (parsedUrl.path) {
            options.path = parsedUrl.path;
        }

        var req = http.request(options, function(res) {
            res.setEncoding('utf8');

            var responseData = '';

            res.on('data', function(str) {
                responseData += str;
            });

            res.on('end', function() {
                cb(null, res, responseData.trim());
            });
        });

        req.on('error', cb);

        req.end(data);
    },

    parseJsonData: function(jsonData) {
        if (jsonData !== undefined) {
            var data;
            try {
                data = JSON.parse(jsonData);
            } catch (error) {
                if (error) {
                    return;
                }
            }
            return data;
        }
    },
    processData: function(data) {
        if (!data) {
            return
        }
        if (Array.isArray(data)) {
            return data;
        } else {
            return module.exports.parseJsonData(data);
        }
    },
    formatDate : function (date, format) {
        var z = {
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds()
        };
        format = format.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
            return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
        });

        return format.replace(/(y+)/g, function(v) {
            return date.getFullYear().toString().slice(-v.length)
        });
    },
    daysInMonth : function (date) {
        var month = date.getMonth() + 1;
        var year = date.getFullYear() + 1;
        return new Date(year, month, 0).getDate();
    }
};
