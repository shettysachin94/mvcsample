/**
 * Project          : DingChak
 * Module           : User
 * Source filename  : User.js
 * Description      : Schema related to users
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */

"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');
var crypto = require('crypto');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Load configurations
var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];
var path = require('path');
var fs = require('fs');

/*
 * User Schema
 */
var UserSchema = new Schema({
    /* Basic info*/

    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        match: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        trim: true,
        unique: true,
        sparse: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        trim: true,
        sparse: true,
        match: /^\d+$/
    },
    hashedPassword: {
        type: String
    },
    salt: {
        type: String
    },
    profilePic: {
        type: String,
        trim: true
    },
    firstLogin: {
        type: Boolean,
        default: true
    },
    facebookId: {
        type: String
    },
    googleId: {
        type: String
    },
    emailVerification: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetTokenCreateTime: {
        type: Date
    },
    isAdmin: {
        type: Boolean
    },
    role: {
        type: String,
        enum: ["admin", "readwrite", "read", "user"],
        default: "user"
    },

    /* addtional fields*/
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'Prefer not to say']
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    createdTimestamp: {
        type: Date,
        default: Date.now
    },
});

UserSchema.plugin(textSearch);
UserSchema.index({
    username: 'text'
});

/**
 * User Methods
 */
UserSchema.methods.encryptPassword = function(password) {
    if (!this.salt) return false;
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

UserSchema.virtual('userId')
    .get(function() {
        return this.id;
    });

UserSchema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('base64');
        //more secure - this.salt = crypto.randomBytes(128).toString('base64');
        this.hashedPassword = this.encryptPassword(password);
        console.log("userpassword updated");
    })
    .get(function() {
        return this._plainPassword;
    });


UserSchema.methods.checkPassword = function(password) {
    if (this.encryptPassword(password) === this.hashedPassword) {
        return true;
    }
    if (crypto.createHash('md5').update(password).digest('hex') === this.hashedPassword) {
        return true;
    }
    return false;
};

UserSchema.statics.validatePassword = function(password) {
    console.log('password: ' + password)
        //var regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,25}$/;
    var regex = /.{6,25}$/;
    return regex.test(password);
};

var User = mongoose.model('User', UserSchema);
