/**
 * Project          : DingChak
 * Module           : Account kit Configuration
 * Source filename  : config.js
 * Description      : Account kit related configuration variables
 * Author           : Lloyd Presly Saldanha <lloyd.presly@robosoftin.com>
 * Copyright        : Copyright © 2016
 *                    Written under contract by DingChak.
 */

"use strict";

var Guid = require('guid');
//const Querystring  = require('querystring');


module.exports = {
	staging: {
		csrf_guid : Guid.raw(),
		api_version : 'v1.0',
		app_id : '756279781181000',
	    app_secret : 'fd6597601ae869eb5cc3ee15bcf41c48',
		me_endpoint_base_url : 'https://graph.accountkit.com/v1.0/me',
		token_exchange_base_url : 'https://graph.accountkit.com/v1.0/access_token',
		login_template : require('path').normalize(__dirname + '/..') + '/Templates/login.html',
		login_success_template : require('path').normalize(__dirname + '/..') + '/Templates/login_success.html',
		sendCode_url : 'http://sapp-devote.saregama.com/api/v1/auth/accountkit/loginWithCode',
		login_url : 'http://sapp-devote.saregama.com/api/v1/auth/accountkit/login',
		login_success : 'http://sapp-devote.saregama.com/api/v1/auth/accountkit/success'
	},
	production: {
		csrf_guid : Guid.raw(),
		api_version : 'v1.0',
		app_id : '756279781181000',
	    app_secret : 'fd6597601ae869eb5cc3ee15bcf41c48',
		me_endpoint_base_url : 'https://graph.accountkit.com/v1.0/me',
		token_exchange_base_url : 'https://graph.accountkit.com/v1.0/access_token',
		login_template : require('path').normalize(__dirname + '/..') + '/Templates/login.html',
		login_success_template : require('path').normalize(__dirname + '/..') + '/Templates/login_success.html',
		sendCode_url : 'http://app-shakti/api/v1/auth/accountkit/loginWithCode',
		login_url : 'http://app-shakti/api/v1/auth/accountkit/login',
		login_success : 'http://localhost:7102/api/v1/auth/accountkit/success'
	}
}