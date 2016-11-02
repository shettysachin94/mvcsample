/**
 * Project          : DingChak
 * Module           : Tokens
 * Source filename  : Token.js
 * Description      : Schema related to access token and refresh token, which are very much required in login authentication.
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */

 "use strict";

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/*
 * Access Token Schema
 */

var AccessTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    code: {
        type: String
    },
    delinked: {
        type: Boolean,
        default: false
    },
    deviceName: {
        type: String
    },
    deviceId: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('AccessToken', AccessTokenSchema);

/*
 * Refresh Token Schema
 */

var RefreshTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    code: {
        type: String
    },
    deviceName: {
        type: String
    },
    deviceId: {
        type: String
    },
    accessToken: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('RefreshToken', RefreshTokenSchema);


