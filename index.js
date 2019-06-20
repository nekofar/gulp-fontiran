'use strict';

var fonts = require('./fonts.json');

var through = require('through2');
var dotenv = require('dotenv');
var async = require('async');
var request = require('request');

var PluginError = require('gulp-error');

var PLUGIN_NAME = 'gulp-fontiran';

module.exports = function (slug) {

    // Make sure font slug passed
    if (!slug || slug === "") {
        new PluginError(PLUGIN_NAME, 'font slug missing.');
    }

    return through.obj(function (file, enc, callback) {
        var self = this;

        if (file.isNull()) {
            self.push(file);
            return callback();
        }

        // Load configs from dotenv file
        var config = dotenv.config({path: file.path});
        if (config.error) {
            new PluginError(PLUGIN_NAME, 'dotenv config file missing.');
        }

        // Get font info using slug
        if (typeof fonts[slug] === 'undefined') {
            new PluginError(PLUGIN_NAME, 'font not found.');
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
         * @param callback
         */
        function loginToSite(callback) {
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

                callback(null, jar);
            });
        }

        /**
         * Fetch the temporary download link of the font
         *
         * @param jar
         * @param callback
         */
        function fetchFontLink(jar, callback) {
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
                    callback(null, url[0]);
                }
            });
        }

        async.waterfall([loginToSite, fetchFontLink], callback);

    });
};
