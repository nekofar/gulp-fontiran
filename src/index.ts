import {fonts, Font} from './fonts';

import es from 'event-stream';
import dotenv from 'dotenv';
import async from 'async';
import request, {CookieJar} from 'request';
import Vinyl from 'vinyl';

import PluginError from 'plugin-error';

const PLUGIN_NAME = 'gulp-fontiran';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
module.exports = (slugs: string[]): any => {

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

    /**
     *
     * @param slug
     * @param callback
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getFontBySlug(slug: string, callback: any): void {

        let opts: {
            fontInfo: Font;
            hostName?: string;
            hostPath?: string;
            password?: string;
            username?: string;
        };

        let err: PluginError;

        // Load configs from dotenv file
        let config = dotenv.config();
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
        if (!(slug in fonts)) {
            err = new PluginError({
                plugin: PLUGIN_NAME,
                message: 'No font was found with this slug.',
            });
            callback(err);
        }

        // Options
        opts = {
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
        function loginToSite(next: Function): void {
            let jar = request.jar();
            let form = {
                log: opts.username,
                pwd: opts.password,
                type: 'cartFromLogin',
                action: 'my_action',
            };
            request.post({
                url: 'https://' + opts.hostName + opts.hostPath,
                form: form,
                jar: jar,
            }, (error, response): void => {
                if (!error && response.statusCode === 200) {
                    next(null, jar);
                } else {
                    let err = new PluginError({
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
        function fetchFontLink(jar: CookieJar, next: Function): void {
            let form = {
                "type": 'downloadRequest',
                "action": 'my_action',
                "package_id": opts.fontInfo.id,
            };
            request.post({
                url: 'https://' + opts.hostName + opts.hostPath,
                form: form,
                jar: jar,
                json: true,
            }, (error, response, body): void => {
                if (body && body.message) {
                    let pattern = '(\\bhttps?:\\/\\/[-A-Z0-9+&@#\\/%?=~_|!:,.;]' +
                        '*[-A-Z0-9+&@#\\/%=~_|])';
                    let matches = new RegExp(pattern, 'i').exec(body.message);
                    next(null, matches ? matches[0] : null)
                } else {
                    let err = new PluginError({
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
        function fetchFontPack(url: string, next: Function): void {
            let file: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let data: any[] = [];
            request.get({url: url})
                .on('response', (response): void => {
                    // Make sure request was successful and content of page is not html
                    if (response.statusCode !== 200 ||
                        (response.headers['content-type'] &&
                            response.headers['content-type'].indexOf('text/html') !== -1)) {
                        let err = new PluginError({
                            plugin: PLUGIN_NAME,
                            message: 'Problem in font temporary link.',
                        });
                        callback(err);
                    } else {
                        // Extract file name from header disposition
                        if (response.headers['content-disposition']) {
                            let disposition = response.headers['content-disposition'];
                            let pattern = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            let matches = pattern.exec(disposition);
                            if (matches != null && matches[1]) {
                                file = matches[1].replace(/['"]/g, '');
                            }
                        }
                    }
                })
                .on('data', (chunk): void => {
                    data.push(chunk);
                })
                .on('end', (): void => {
                    if (file) {
                        next(null, new Vinyl({
                            path: file,
                            contents: Buffer.concat(data),
                        }));
                    }
                });
        }

        async.waterfall([loginToSite, fetchFontLink, fetchFontPack], callback);

    }

    return es.readArray(slugs).pipe(es.map(getFontBySlug)).on('error', (error): void => {
        console.log(error.toString());
    });
};
