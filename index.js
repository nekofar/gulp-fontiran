'use strict';

var through = require('through2');

var PluginError = require('gulp-error');

var PLUGIN_NAME = 'gulp-fontiran';

module.exports = function () {
    return through.obj(function (file, enc, callback) {
        var self = this;

        if (file.isNull()) {
            self.push(file);
            return callback();
        }

    });
};
