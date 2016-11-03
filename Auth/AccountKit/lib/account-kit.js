/**
 * Project          : DingChak
 * Module           : Account-Kit
 * Source filename  : account-kit.js
 * Description      : Generic methods related to Facebook Account Kit Login
 * Author           : Lloyd Presly Saldanha <lloyd.presly@gmail.com>
 * Copyright        : Copyright © 2014
 *                    Written under contract by DingChak.
 */

var async = require('async');
var config = require('../Config/config').staging;
var fs = require('fs');
var Request  = require('request');
var Querystring  = require('querystring');

module.exports = {
    loadTemplate : function(template, cb) {
    	var login_template = template;
    	if (template === undefined) {
    		login_template = config.login_template;
    	}

        fs.readFile(login_template, 'utf8', function(err, html) {
            if (err) {
                console.log(err);
                return cb(err);
            }

            return cb(null, html);
        });
    	return fs.readFileSync(login_template).toString();
    },
    getAccountKitCSRF : function(cb) {
    	return cb(null, config.csrf_guid);
    },
    accountKitLogin : function(data, cb) {
    	module.exports.loadTemplate(config.login_template, function(err, html) {
    		if (err) {
    			console.log(err);
    			return cb(err);
    		} else {
    			var sendCode_url = config.sendCode_url + '?deviceID=' + data.deviceID + '&deviceName=' + data.deviceName  + '&appVersion=' + data.appVersion  + '&osVersion=' + data.osVersion  + '&os=' + data.os;
    			var replacements = {
    				"%loginType%":data.loginType,
		            "%FACEBOOK_APP_ID%":config.app_id,
		            "%csrf%": config.csrf_guid,
		            "%version%": config.api_version,
		            "%sendCode_url%": sendCode_url,
		            "%deviceID%": data.deviceID,
		            "%deviceName%": data.deviceName,
		            "%appVersion%": data.appVersion,
		            "%osVersion%": data.osVersion,
		            "%os%": data.os
		        };
		        html = html.replace(/%\w+%/g, function(all) {
		            return replacements[all] || all;
		        });
		        return cb(err, html);
    		}
    	});
    },
    validateAuthCode : function(data, cb) {
    	var app_access_token = ['AA', config.app_id, config.app_secret].join('|');
	    var params = {
			grant_type: 'authorization_code',
			code: data.code,
			access_token: app_access_token
	    };
  
    	// exchange tokens
    	var token_exchange_url = config.token_exchange_base_url + '?' + Querystring.stringify(params);
    	console.log(token_exchange_url);
    	Request.get({url: token_exchange_url, json: true}, function(err, resp, respBody) {
    		if (respBody.access_token || data.access_token) {
    			var content = {
					user_access_token: respBody.access_token,
					expires_at: respBody.expires_at,
					user_id: respBody.id,	
				};
				var method = 'Email';
				var access_token = respBody.access_token;
				if (data.access_token) {
					access_token = data.access_token
				}

		     	// get account details at /me endpoint
				var me_endpoint_url = config.me_endpoint_base_url + '?access_token=' + access_token;
				var access_code = respBody.access_token;
				console.log(me_endpoint_url);
				Request.get({url: me_endpoint_url, json: true}, function(err, resp, respBody) {
					// send login_success.html
					if (err) {
						return cb(err);
					}
					console.log("respBody:",respBody);
					var identity;
					if (respBody.phone) {
                        identity = respBody.phone.number;
                        content.phoneWithCode=respBody.phone.number;
                        content.phone = respBody.phone.national_number;
                        content.phoneCode=respBody.phone.country_prefix;
					} else if (respBody.email) {
					 	identity = respBody.email.address;
					 	content.email = identity;
					}
					content.id = respBody.id;
					//var html = Mustache.to_html(loadLoginSuccess(), view);
					module.exports.loadTemplate(config.login_success_template, function(err, html) {
			    		if (err) {
			    			console.log(err);
			    			return cb(err);
			    		} else {
			    			var login_success = config.login_success + '?method=' + method + '&identity=' + identity + '&access_code=' + access_code;
			    			content.access_code = access_code;
			    			var replacements = {
					            "%method%":method,
					            "%identity%": identity,
					            "%login_success%": login_success
					        };
					        html = html.replace(/%\w+%/g, function(all) {
					            return replacements[all] || all;
					        });
					        return cb(err, html, content);
			    		}
			    	});
				});
    		} else {
    			return cb(new Error("Invalid access code."));
    		}
    	});
    // 	if (data.csrf_nonce === config.csrf_guid) {

	  	// } else {
	   //  	// login failed
	   //  	return cb(new Error("Something went wrong. :("));
	   //  	// response.writeHead(200, {'Content-Type': 'text/html'});
	   //  	// response.end("Something went wrong. :( ");
	  	// }
    } 
}
