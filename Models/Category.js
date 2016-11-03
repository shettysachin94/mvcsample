/**
 * Project          : DingChak
 * Module           : Category
 * Source filename  : Category.js
 * Description      : Schema related to Category
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
 * Category Schema
 */
var CategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        sparse: true
    },
    categoryImage: {
        type: String
    },
    order: {
        type: Number
    }
});

mongoose.model('Category', CategorySchema);
