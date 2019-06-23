'use strict';

var fonts = require('./fonts.json');

var es = require('event-stream');
var dotenv = require('dotenv');
var async = require('async');
var request = require('request');
var Vinyl = require('vinyl');

var PluginError = require('plugin-error');

var PLUGIN_NAME = 'gulp-fontiran';

module.exports = function(slugs) {

  // Make sure font slug passed
  if (!slugs) {
    throw new PluginError({
      plugin: PLUGIN_NAME,
      message: 'Font slug is missing.',
    });
  }

  // Convert strings to array
  if (!Array.isArray(slugs)) {
    slugs = [slugs];
  }

  return es.readArray(slugs).pipe(es.map(function(slug, callback) {

    var err;

    // Load configs from dotenv file
    var config = dotenv.config();
    if (!config) {
      err = new PluginError({
        plugin: PLUGIN_NAME,
        message: '.env config is file missing.',
      });
      callback(err);
    }

    // Make sure font iran login info defined
    if (typeof process.env.FI_USER === 'undefined' ||
      typeof process.env.FI_PASS === 'undefined') {
      err = new PluginError({
        plugin: PLUGIN_NAME,
        message: '.env config fontiran login data missing.',
      });
      callback(err);
    }

    // Get font info using slug
    if (typeof fonts[slug] === 'undefined') {
      err = new PluginError({
        plugin: PLUGIN_NAME,
        message: 'No font was found with this slug.',
      });
      callback(err);
    }

    // Options
    var opts = {
      fontInfo: fonts[slug],
      username: process.env.FI_USER,
      password: process.env.FI_PASS,
      hostName: 'fontiran.com',
      hostPath: '/wp-admin/admin-ajax.php',
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
        action: 'my_action',
      };
      request.post({
        url: 'https://' + opts.hostName + opts.hostPath,
        form: form,
        jar: jar,
      }, function(error, response) {
        if (!error && response.statusCode === 200) {
          next(null, jar);
        } else {
          var err = new PluginError({
            plugin: PLUGIN_NAME,
            message: 'Login process to the fontiran failed.',
          });
          callback(err);
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
        package_id: opts.fontInfo.id,
      };
      request.post({
        url: 'https://' + opts.hostName + opts.hostPath,
        form: form,
        jar: jar,
        json: true,
      }, function(error, response, body) {
        if (body && body.message) {
          var pattern = '(\\bhttps?:\\/\\/[-A-Z0-9+&@#\\/%?=~_|!:,.;]' +
            '*[-A-Z0-9+&@#\\/%=~_|])';
          var matches = new RegExp(pattern, 'i').exec(body.message);
          next(null, matches[0]);
        } else {
          var err = new PluginError({
            plugin: PLUGIN_NAME,
            message: 'Fetch font temporary link failed.',
          });
          callback(err);
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
      var file = '';
      var data = [];
      request.get({ url: url })
        .on('response', function(response) {
          // Make sure request was successful and content of page is not html
          if (response.statusCode !== 200 ||
            response.headers['content-type'].indexOf('text/html') !== -1) {
            var err = new PluginError({
              plugin: PLUGIN_NAME,
              message: 'Problem in font temporary link.',
            });
            callback(err);
          } else {
            // Extract file name from header disposition
            var disposition = response.headers['content-disposition'];
            var pattern = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = pattern.exec(disposition);
            if (matches != null && matches[1]) {
              file = matches[1].replace(/['"]/g, '');
            }
          }
        })
        .on('data', function(chunk) {
          data.push(chunk);
        })
        .on('end', function() {
          if (file) {
            next(null, new Vinyl({
              path: file,
              contents: Buffer.concat(data),
            }));
          }
        });
    }

    async.waterfall([loginToSite, fetchFontLink, fetchFontPack], callback);

  })).on('error', function(error) {
    console.log(error.toString());
  });
};
