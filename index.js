var fonts = require('./fonts.json');

var es = require('event-stream');
var dotenv = require('dotenv');
var async = require('async');
var request = require('request');
var Vinyl = require('vinyl');

var PluginError = require('plugin-error');

var PLUGIN_NAME = 'gulp-fontiran';

module.exports = function (slugs) {
    'use strict';

    // Make sure font slug passed
    if (!slugs) {
        throw new PluginError(PLUGIN_NAME, 'Font slug is missing.');
    }

    // Convert strings to array
    if (!Array.isArray(slugs)) {
        slugs = [slugs];
    }

    return es.readArray(slugs).pipe(es.map(function(slug, callback) {

        // Load configs from dotenv file
        var config = dotenv.config();
        if (!config) {
            callback(new PluginError(PLUGIN_NAME, '.env config is file missing.'));
        }

        // Make sure font iran login info defined
        if (typeof process.env.FI_USER === 'undefined' || typeof process.env.FI_PASS === 'undefined') {
            callback(new PluginError(PLUGIN_NAME, '.env config fontiran login data missing.'));
        }

        // Get font info using slug
        if (typeof fonts[slug] === 'undefined') {
            callback(new PluginError(PLUGIN_NAME, 'No font was found with this slug.'));
        }

        // Options
        var opts = {
            fontInfo: fonts[slug],
            username: process.env.FI_USER,
            password: process.env.FI_PASS,
            hostName: 'fontiran.com',
            hostPath: '/wp-admin/admin-ajax.php'
        };

        /**
         * Login to site and pass the cookie
         *
         * @param next
         */
        function loginToSite(next) {
            var jar = request.jar();
            var form = {
                log: opts.username,
                pwd: opts.password,
                type: 'cartFromLogin',
                action: 'my_action'
            };
            request.post({
                url: 'https://' + opts.hostName + opts.hostPath,
                form: form,
                jar: jar
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    next(null, jar);
                } else {
                    callback(new PluginError(PLUGIN_NAME, 'Login process to the fontiran failed.'));
                }
            });
        }

        /**
         * Fetch the temporary download link of the font
         *
         * @param jar
         * @param next
         */
        function fetchFontLink(jar, next) {
            var form = {
                type: 'downloadRequest',
                action: 'my_action',
                package_id: opts.fontInfo.id
            };
            request.post({
                url: 'https://' + opts.hostName + opts.hostPath,
                form: form,
                jar: jar,
                json: true
            }, function (error, response, body) {
                if (body && body.message) {
                    var url = body.message.match(/(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i);
                    next(null, url[0]);
                } else {
                    callback(new PluginError(PLUGIN_NAME, 'Fetch font temporary link failed.'));
                }
            });
        }

        /**
         * Fetch font file from temporary url
         *
         * @param url
         * @param next
         */
        function fetchFontPack(url, next) {
            var file = "";
            var data = [];
            request.get({url: url})
                .on('response', function (response) {
                    // Make sure request was successful and content of page is not html
                    if (response.statusCode !== 200 || response.headers['content-type'].indexOf('text/html') !== -1) {
                        callback(new PluginError(PLUGIN_NAME, 'Problem in font temporary link.'));
                    } else {
                        // Extract file name from header disposition
                        var disposition = response.headers['content-disposition'];
                        var matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                        if (matches != null && matches[1]) {
                            file = matches[1].replace(/['"]/g, '');
                        }
                    }
                })
                .on('data', function (chunk) {
                    data.push(chunk);
                })
                .on('end', function () {
                    if (file) {
                        callback(null, new Vinyl({
                            path: file,
                            contents: Buffer.concat(data)
                        }));
                    }
                });
        }

        async.waterfall([loginToSite, fetchFontLink, fetchFontPack], callback);

    })).on('error', console.log);
};