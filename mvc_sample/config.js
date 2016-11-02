/**
 * Project          : DingChak
 * Module           : Configuration
 * Source filename  : config.js
 * Description      : Environment related configuration variables
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */

"use strict";

module.exports = {
    development: {
        root: require('path').normalize(__dirname + '/..'),
        app: {
            name: 'DingChak-api'
        },
        // host: process.env.HOST || 'http://stanford.robosoftin.com',
        host: process.env.HOST || 'http://localhost',
        port: process.env.PORT || 8080,
        workerHost:process.env.WORKER_HOST || 'http://localhost:8080',
        dbURL: process.env.MONGODB_URL || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/dingchak_development",
        version: '0.0.1',
        URLPrefix: '/api/v1',
        security: {
            tokenLife: 3600
        },
        facebook: {
            clientID:'1111',
            clientSecret: '2222'
        },
        google:{
            clientID:'359406304612-srvevs1jsbbttg0tubh41jins9fn3a1n.apps.googleusercontent.com',
            clientSecret: '11tFxKDym9ESeAJOkoVsRmOo'
        },
        email: {
            senderEmail: 'dingchak@gmail.com',
            password: ''
        }
    },
    staging: {
        root: require('path').normalize(__dirname + '/..'),
        app: {
            name: 'DingChak-api'
        },
        host: process.env.HOST || 'http://ec2-52-43-79-87.us-west-2.compute.amazonaws.com',
        port: process.env.PORT || 8080,
        workerHost:process.env.WORKER_HOST || 'http://ec2-52-43-79-87.us-west-2.compute.amazonaws.com',
        dbURL: process.env.MONGODB_URL || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017:27017/API_Server_Staging",
        options : { db: { native_parser: true }, user: 'dingchak-user', pass: 'dingchakuser123*' },
        session_timeout: 20 * 60 * 10, // defaults to 20 minutes, in ms (20 * 60 * 10)
        version: '0.0.1',
        URLPrefix: '/api/v1',
        security: {
            tokenLife: 3600
        },
        facebook: {
            clientID:'1392263647457019',
            clientSecret: 'db959d435314e38374f1515cd207ae9e'
        },
        google:{
            clientID:'359406304612-srvevs1jsbbttg0tubh41jins9fn3a1n.apps.googleusercontent.com',
            clientSecret: '11tFxKDym9ESeAJOkoVsRmOo'
        },
        email: {
            senderEmail: 'dingchak@gmail.com',
            password: ''
        }
    },
    production: {
        root: require('path').normalize(__dirname + '/..'),
        app: {
            name: 'DingChak-api'
        },
        host: process.env.HOST || 'http://dingchak.com',
        port: process.env.PORT || 8080,
        workerHost:process.env.WORKER_HOST || 'http://dingchak.com',
        dbURL: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/API_Server_Production",
        options : { db: { native_parser: true }, user: 'dingchak-user', pass: 'dingchakuser123*' },
        sessionTimeout: 20 * 60 * 10, // defaults to 20 minutes, in ms (20 * 60 * 10)
        version: '0.0.1',
        URLPrefix: '/api/v1',
        security: {
            tokenLife: 3600
        },
        facebook: {
            clientID:'',
            clientSecret: ''
        },
        google:{
            clientID:'',
            clientSecret: ''
        },
        email: {
            senderEmail: 'dingchak@gmail.com',
            password: ''
        }
    }
};
