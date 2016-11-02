/**
 * Project          : DingChak
 * Module           : Clustering and Bootstrapping
 * Source filename  : app.js
 * Description      : Cluster and fork to number of CPU's available and bootstrap modules.
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014,
 *                    Written under contract by DingChak.
 */

"use strict";


var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];

var express = require('express');

var server = express();
var bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: true
}));

// server.configure(function(){
//   server.use(express.bodyParser());
// });

var fs = require('fs');
var path = require('path');
var passport = require('passport');
var multer = require('multer');

var mongoose = require('mongoose');
mongoose.connect(config.dbURL);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Database connection to MongoDB opened.");
});

//Cross Domain
server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    if(req.headers.origin !== undefined) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
    } else {
        res.header("Access-Control-Allow-Origin", "*");
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Encoding ,authorization,content-type, enctype');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,PATCH');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    //res.header('Access-Control-Max-Age', '3000');

    if(req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

server.use(multer({ dest: __dirname + '/Public/uploads/' }));

server.use(passport.initialize());
server.use(passport.session());

//loging api details to the console
var morgan = require('morgan');

server.use(morgan('dev'));
server.use(morgan(':method :url :status :response-time ms - :res[content-length] :req[headers]'));
server.all('*', function (req, res, next) {
    console.log('---------------------------------------------------------------------------');
    console.log('%s %s on %s from ', req.method, req.url, new Date());
    console.log('Request Authorized User: ', (req.isAuthenticated())? req.user._id: 'Not authenticated');
    console.log('Request Headers: ', req.headers);
    console.log('Request Body: ', req.body);
    console.log('Request Files: ', req.files);
    next();
});

console.log("path:",__dirname);
var rootPath = path.normalize(__dirname);

var modelPath = rootPath + '/Models';
var routePath = rootPath + '/Routes';

var modelPathFiles = fs.readdirSync(modelPath);
console.log(modelPathFiles);

modelPathFiles.forEach(function(file) {
    console.log(file);
    require(modelPath + '/' + file);
});

var utilities = require('./Utilities/utilities')

fs.readdirSync(routePath).forEach(function(file) {
    console.log(file);
    require(routePath + '/' + file)(server, config, utilities);
});

require('./Auth/auth')(passport, config);

server.use('/doc', express.static(__dirname + '/doc'));
server.use('/coverages', express.static(__dirname + '/coverage'));
server.use('/coverage', express.static(__dirname + '/coverage/lcov-report'));
server.use('/uploads', express.static(__dirname + '/Public/uploads'));

server.get('/ping', function(req, res) {
	res.send('pong');
});

server.listen(8080, function() {
	console.log("server is running on port 8080");
});

module.exports = server;
