'use strict';

var fonts = require('./fonts.json');

var through = require('through2');
var dotenv = require('dotenv');

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



    });
};
