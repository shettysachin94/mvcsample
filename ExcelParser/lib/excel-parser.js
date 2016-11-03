/**
 * Project          : DingChak
 * Module           : Excel-Parser
 * Source filename  : excel-parser.js
 * Description      : Generic methods related to excel sheet parsing
 * Author           : Lloyd Presly Saldanha <Lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2016
 *                    Written under contract by DingChakd.
 */

var excelParser = require('excel-parser');
var async = require('async');
var config = require('../Config/config');
var settings = config.settings;

module.exports = {
    getWorksheets : function(fileToParse, cb) {
        var worksheets;
        excelParser.worksheets({
            inFile: fileToParse
        }, function(err, worksheets){
            if(err) {
                return cb(err);
            }
            if(!worksheets || !worksheets.length) {
                return cb(new Error('No Worksheets Found'));
            }
            var requiredSheets = settings.worksheets.slice();
            async.each(worksheets, function(worksheet, callback){
                var index = requiredSheets.indexOf(worksheet.name);
                requiredSheets.splice(index, 1);
                callback();
            }, function(){
                if(requiredSheets.length) {
                    return cb(new Error('Some worksheets were not found'));
                }
                return cb(null, worksheets);
            });
        });
    },getUserIDWorksheets : function(fileToParse, cb) {
        var worksheets;
        excelParser.worksheets({
            inFile: fileToParse
        }, function(err, worksheets){
            if(err) {
                return cb(err);
            }
            if(!worksheets || !worksheets.length) {
                return cb(new Error('No Worksheets Found'));
            }
            var requiredSheets = settings.excelsheets.slice();
            async.each(worksheets, function(worksheet, callback){
                var index = requiredSheets.indexOf(worksheet.name);
                requiredSheets.splice(index, 1);
                callback();
            }, function(){
                if(requiredSheets.length) {
                    return cb(new Error('Some worksheets were not found'));
                }
                return cb(null, worksheets);
            });
        });
    },
    getOptionalWorksheets : function(fileToParse, cb) {
        var worksheets;
        excelParser.worksheets({
            inFile: fileToParse
        }, function(err, worksheets){
            if(err) {
                return cb(err);
            }
            if(!worksheets || !worksheets.length) {
                return cb(new Error('No Worksheets Found'));
            }
            var sheets = [];
            async.each(worksheets, function(worksheet, callback){
                sheets.push(worksheet.name);
                callback();
            }, function(){
                return cb(null, sheets);
            });
        });
    },
    getUserIDWorksheets : function(fileToParse, cb) {
        var worksheets;
        excelParser.worksheets({
            inFile: fileToParse
        }, function(err, worksheets){
            if(err) {
                return cb(err);
            }
            if(!worksheets || !worksheets.length) {
                return cb(new Error('No Worksheets Found'));
            }
            var requiredSheets = settings.excelsheets.slice();
            async.each(worksheets, function(worksheet, callback){
                var index = requiredSheets.indexOf(worksheet.name);
                requiredSheets.splice(index, 1);
                callback();
            }, function(){
                if(requiredSheets.length) {
                    return cb(new Error('Some worksheets were not found'));
                }
                return cb(null, worksheets);
            });
        });
    },
    parseWorksheet : function(fileToParse, type, cb) {
        excelParser.parse({
            inFile: fileToParse,
            worksheet: type,
        },function(err, records){
            if(err) {
                return cb(err);
            }
            var keys = records[0];
            var results = [];
            records.splice(0,1);
            async.each(records, function(record, outerCallback){
                var result = {};
                async.each(keys, function(key, innerCallback){
                    result[key] = record[keys.indexOf(key)];
                    innerCallback();
                }, function(){
                    results.push(result);
                    outerCallback();
                })
            }, function(){
                cb(null, results)
            });
        });
    }
};
