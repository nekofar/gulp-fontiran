# gulp-fontiran 
[![Build Status](https://travis-ci.com/nekofar/gulp-fontiran.svg?branch=master)](https://travis-ci.com/nekofar/gulp-fontiran)
[![Packages](https://img.shields.io/badge/version-1.0.5-blue.svg?cacheSeconds=2592000)](https://github.com/nekofar/gulp-fontiran/packages) 
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg) ](https://github.com/nekofar/gulp-fontiran#readme) 
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg) ](https://github.com/nekofar/gulp-fontiran/graphs/commit-activity) 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/nekofar/gulp-fontiran/blob/master/LICENSE)

> Download purchased fonts from Fontiran

### 🏠 [Homepage](https://github.com/nekofar/gulp-fontiran)

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

## Author

👤 Milad Nekofar

* Github: [@nekofar](https://github.com/nekofar)
* Twitter: [@nekofar](https://twitter.com/nekofar)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/nekofar/gulp-fontiran/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Milad Nekofar](https://github.com/nekofar).<br />
This project is [MIT](https://github.com/nekofar/gulp-fontiran/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
