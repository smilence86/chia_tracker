/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
import fs from 'fs';
import path from 'path';
import config from 'config';
import crypto from 'crypto';
import moment from 'moment';
import child_process from 'child_process';
import util from 'util';
const exec = util.promisify(child_process.exec);

class UtilsService {

    static instance;

    env;

    constructor() {
        this.env = this.getEnv();
    }

    static getInstance() {
        if (!UtilsService.instance) {
            UtilsService.instance = new UtilsService();
        }
        return UtilsService.instance;
    }

    getEnv() {
        return process.env.NODE_ENV || 'test';
    }

    config(item) {
        return config[item];
    }

    monthFormat(date) {
        if (!date) {
            date = new Date();
        }
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return moment(date).format('YYYY-MM');
    }

    dateFormat(date) {
        if (!date) {
            date = new Date();
        }
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return moment(date).format('YYYY-MM-DD');
    }

    dateTimeFormat(date) {
        if (!date) {
            date = new Date();
        }
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * @param milliseconds 
     * @returns 
     * an hour ago
     * a few seconds ago
     */
    fromNow(milliseconds) {
        return moment().subtract(milliseconds, 'milliseconds').fromNow();
    }

    yesterday(date) {
        if (!date) {
            date = new Date();
        }
        if (typeof date === 'string') {
            date = new Date(date);
        }
        date.setDate(date.getDate() - 1);
        return date;
    }

    tomorrow(date) {
        if (!date) {
            date = new Date();
        }
        if (typeof date === 'string') {
            date = new Date(date);
        }
        date.setDate(date.getDate() + 1);
        return date;
    }

    moment () {
        return moment();
    }

    delay(t, v) {
        return new Promise(function (resolve) {
            setTimeout(resolve.bind(null, v), t);
        });
    }

    // execShell(cmd: string): Promise<string> {
    //     console.log(`cmd: ${cmd}`);
    //     return new Promise((resolve, reject) => {
    //         child_process.exec(cmd, function (e, stdout, stderr) {
    //             if (e) {
    //                 resolve(e.toString());
    //             } else {
    //                 resolve(stdout);
    //             }
    //         });
    //     });
    // }

    async execShell(cmd) {
        console.log(`cmd: ${cmd}`);
        let result = null;
        try {
            
            const { stdout, stderr } = await exec(cmd);
            
            result = stdout || stderr;

            // console.log(`execShell stdout: ${stdout}`);

            if (stderr) {
                console.log(`execShell stderr: ${stderr}`);
                // throw new Error(stderr);
            }
        } catch (e) {
            console.log(`execShell exception:`);
            console.error(e.stack || e);
            result = e.stack || e;
            throw result;
        }
        return result;
    }
}

export const Utils = UtilsService.getInstance();
// (async () => {
//     const result = await Utils.execShell('ls -l');
//     console.log(result);
// })()
