/**
 * Project          : DingChak
 * Module           : category
 * Source filename  : category.js
 * Description      : Api's related to categories
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */


"use strict";

var mongoose = require('mongoose');
var async = require('async');
var Category = mongoose.model('Category');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports = function(server, config, functions) {
    var URLPrefix = config.URLPrefix;

    /**
     * @api {post} /categories Create Category
     * @apiVersion 0.0.1
     * @apiName Create Category
     * @apiGroup Category
     *
     * @apiDescription Create a Category
     *
     * @apiParam {String} name The unique name for the category.
     * @apiParam {String} [categoryImage] The URL of the category image.
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *     "meta": {
     *         "code": 0,
     *         "currentDate": "2014-11-13T05:06:03.434Z"
     *     },
     *     "pagination": {},
     *     "data":
     *       {
     *          "_id": "55719f58f3e3134a07000002",
     *          "categoryImage": "/Public/uploads/category/55719f58f3e3134a07000002/background.jpg",
     *          "name": "Fusion"
     *       }
     *
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse DuplicateRecordError
     *
     * @apiUse InvalidParameterError
     */

    server.post(URLPrefix + '/categories', function(req, res) {
        // if (!req.user || (req.user && !req.user.isAdmin)) {
        //     return functions.notifyError(res, 'NotAuthorized', 2001, 403, 'User not logged in');
        // }

        functions.checkRequired(req, res, ['name'],
            function(err) {
                if (!err) {
                    var category = new Category(req.body);
                    category.save(function(err, category) {
                        if (err) {
                            return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
                        } else {
                            return functions.sendData(res, category);
                        }
                    })
                }
            }
        );
    });

    /**
     * @api {get} /categories List all the categories
     * @apiVersion 0.0.1
     * @apiName List Categories
     * @apiGroup Category
     *
     * @apiDescription listed all the categories
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *     "meta": {
     *         "code": 0,
     *         "currentDate": "2014-11-13T05:06:03.434Z"
     *     },
     *     "pagination": {},
     *     "data":
     *       [{
     *          "_id": "557188a13fa844a306000002",
     *          "categoryImage": "/Public/uploads/category/557188a13fa844a306000002/background.jpg",
     *          "name": "Carnatic"
     *       },
     *       {
     *           "_id": "557188d13fa844a306000003",
     *           "categoryImage": "/Public/uploads/category/557188d13fa844a306000003/background.jpg",
     *           "name":"Hindustani"
     *       }]
     *
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     */

    server.get(URLPrefix + '/categories', function(req, res) {
        var find = {};
        if(req.query.name) {
            find.name = req.query.name;
        }
        Category.find(find, function(err, categories) {
            if (err) {
                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
            } else {
                return functions.sendData(res, categories);
            }
        })
    });

    /**
     * @api {get} /categories/:categoryId Get category details
     * @apiVersion 0.0.1
     * @apiName Get category details
     * @apiGroup Category
     *
     * @apiDescription Get category details
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *     "meta": {
     *         "code": 0,
     *         "currentDate": "2014-11-13T05:06:03.434Z"
     *     },
     *     "pagination": {},
     *     "data":
     *       {
     *          "_id": "557188a13fa844a306000002",
     *          "categoryImage": "/Public/uploads/category/557188a13fa844a306000002/background.jpg",
     *          "name": "Carnatic"
     *       }
     *
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     */


    server.get(URLPrefix + '/categories/:categoryId', function(req, res) {
        Category.findById(req.params.categoryId, function(err, category) {
            if (err) {
                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
            } else if (!category) {
                return functions.notifyError(res, 'NotFound', 5001, 404, 'category not found')
            } else {
                return functions.sendData(res, category);
            }
        })
    });

    /**
     * @api {delete} /categories/:categoryId Delete a category
     * @apiVersion 0.0.1
     * @apiName Delete Category
     * @apiGroup Category
     *
     * @apiDescription Delete a category
     *
     * @apiSuccessExample Response:
     *     HTTP/1.1 200 OK
     *     "meta": {
     *         "code": 0,
     *         "currentDate": "2014-11-13T05:06:03.434Z"
     *     },
     *     "pagination": {},
     *     "data":
     *       {
     *          "_id": "557188a13fa844a306000002",
     *          "categoryImage": "/Public/uploads/category/557188a13fa844a306000002/background.jpg",
     *          "name": "Carnatic"
     *       }
     *
     *
     * @apiUse DatabaseFailureError
     *
     * @apiUse InvalidParameterError
     */


    server.delete(URLPrefix + '/categories/:categoryId', function(req, res) {
        Category.findById(req.params.categoryId, function(err, category) {
            if (err) {
                return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
            } else if (!category) {
                return functions.notifyError(res, 'NotFound', 5001, 404, 'category not found')
            } else {
                category.remove(function(err, category) {
                    if (err) {
                        return functions.notifyError(res, 'DatabaseFailure', 5001, 500, err.message)
                    } else {
                        return functions.sendData(res, category);
                    }
                });
            }
        });
    });
};
