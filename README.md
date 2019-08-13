# Gulp Plugin for Fontiran 

[![Packages](https://img.shields.io/badge/version-1.0.5-blue.svg?cacheSeconds=2592000)][1]
[![Build Status](https://travis-ci.com/nekofar/gulp-fontiran.svg?branch=master) ][2]
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg) ][3]
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg) ][4]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)][5]
[![Twitter: nekofar](https://img.shields.io/twitter/follow/nekofar.svg?style=flat)][6]

> Download purchased fonts from Fontiran

## Install

```sh
npm install --save @nekofar/gulp-fontiran
```

Or add this package to your `package.json` file:

```json
{
    "dependencies": {
        "@nekofar/gulp-fontiran": "^1.0.5"
    }
}
```

## Usage

You need to create a `.env` file inside the root of your project and add `FI_USER` and `FI_PASS` keys, populated by your username and password.

```js
var gulp = require('gulp');
var unzip = require('gulp-unzip');
var fontiran = require('gulp-fontiran');

gulp.task('fonts', function () {
    return fontiran(['kamva', 'iran'])
        .pipe(unzip())
        .pipe(gulp.dest('./src/assets/fonts/'));
});
```

## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/nekofar/gulp-fontiran/issues).

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_

[1]: https://www.npmjs.com/package/@nekofar/gulp-fontiran
[2]: https://travis-ci.com/nekofar/gulp-fontiran
[3]: https://github.com/nekofar/gulp-fontiran#readme
[4]: https://github.com/nekofar/gulp-fontiran/graphs/commit-activity
[5]: https://github.com/nekofar/gulp-fontiran/blob/master/LICENSE
[6]: http://twitter.com/nekofar
