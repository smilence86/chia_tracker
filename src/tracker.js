import fs from 'fs';
import os from 'os';
import path from 'path';
import jsonfile from 'jsonfile';
import request from 'superagent';
import puppeteer from 'puppeteer';
import { wechat } from './notifier/wechat.js';
import { telegram } from './notifier/telegram.js';
import randomUseragent from 'random-useragent';
import { Utils } from './utils.js';

class Tracker {

    constructor () {

        // this.pagePrefix = 'https://blockchain.chiaexplorer.com/blockchain/address/';

        this.pagePrefix = 'https://xch.dwd.com/info/address/';
        
        this.balancePrefix = 'https://this-api-will-break-all-the-time-do-not-use-2124.chiaexplorer.com/balance/';

        this.pricePrefix = 'https://abc.chiaexplorer.com/currentPrice';
    }

    async start() {
        console.log(`start checking: [${new Date().toISOString()}] ------------------\n`);
        const filepath = path.resolve(process.cwd(), 'config/default.json');
        const config = await this.readConfig(filepath);

        this.pagePrefix = config.pagePrefix;

        for await (const account of config.accounts) {
            const res = await this.trackingOneWallet(filepath, config, account);
            if (res === -1) {
                continue;
            }
            console.log('\n');
        }
        console.log(`check completed. [${new Date().toISOString()}] ------------------\n\n\n`);
    }

    async trackingOneWallet(filepath, config, account) {

        const result = await this.crawlBalance(account.wallet);
        console.info(`crawled balance: ${result.balance}`);
        console.info(`crawled price: ${result.price}`);

        if (result.balance === -1) {
            return result.balance;
        }
        
        const { register, diff, from, to } = this.compareBalance(account, result.balance);
        
        if (!diff) {
            console.info(`Wallet [${account.wallet}]'s balance has no change.`);
        } else {
            console.info(`Wallet [${account.wallet}]'s balance has changed, from ${from} to ${to}.`);
            account.history.push({
                balance: result.balance,
                price: result.price,
                at: Date.now()
            });
            await this.saveConfig(filepath, config);
            // send notification
            await this.sendNotification(register, account, result.price, from, to);
        }
    }

    async readConfig(filepath) {
        if(!fs.existsSync(filepath)) {
            throw 'Missing config file, please provide it first!';
        }
        const config = await jsonfile.readFile(filepath);
        // console.log(config);
        return config;
    }

    async saveConfig(filepath, config) {
        return await jsonfile.writeFile(filepath, config, { spaces: 4, EOL: '\r\n' });
    }

    async crawl() {
        const balance = await this.crawlBalance();
        const price = await this.crawlPrice();
        return { balance, price };
    }

    /**
     * get balance by wallet address
     * @param {string} wallet 
     */
    async crawlBalanceByHttp(wallet) {
        console.log(wallet);
        let balance = -1;
        try{
            const url = this.balancePrefix + wallet;
            console.log(url);
            const now = Date.now()
            const res = await request.get(url)
                // .set('cache-control', 'max-age=0')
                // .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
                // .set('Accept-Encoding', 'gzip, deflate, br')
                // .set('host', 'https://www.chiaexplorer.com')
                .set('origin', 'https://www.chiaexplorer.com')
                .set('Referer', 'https://www.chiaexplorer.com/')
                .set('sec-ch-ua', 'Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"')
                .set('sec-ch-ua-mobile', '?0')
                .set('sec-fetch-dest', 'empty')
                .set('sec-fetch-mode', 'cors')
                .set('sec-fetch-site', 'same-site')
                // .set('accept-language', 'en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7')
                .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36')
                // .set('cookie', `_ga=GA1.2.7310883.1623221354; _gid=GA1.2.78212285.${parseInt(now/1000)}`)
                // .set('Content-Type', 'application/json')
                .timeout(10 * 1000).retry(3);
            console.info(res.text);
            balance = res.body.netBalance / 1000000000000;
        }catch(e){
            console.error(e.response);
            console.error(e.stack || e);
        }
        return balance;
    }

    /**
     * get balance by wallet address
     * @param {string} wallet 
     */
     async crawlBalance(wallet) {
        return new Promise( async (resolve, reject) => {
            let browser = null;
            let page = null;

            const results = {
                balance: -1,
                price: -1
            };
            try {
                const url = this.pagePrefix + wallet;
                console.log(`Checking url: ${url}`);
                const options = {
                    headless: 'new',
                    ignoreHTTPSErrors: true,
                    acceptInsecureCerts: true,
                    args: ['--headless', '--start-maximized', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--no-zygote']
                };
                // console.log(`PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
                
                // use PUPPETEER_EXECUTABLE_PATH in docker instead of node_modules
                if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                    options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                }

                console.log('puppeteer launched');
                browser = await puppeteer.launch(options);

                console.log('puppeteer newPage');
                page = await browser.newPage();

                console.log('puppeteer setUserAgent');
                const userAgent = randomUseragent.getRandom((ua) => {
                    return ua.browserName === 'Firefox';
                });
                await page.setUserAgent(userAgent);
                // await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');

                console.log('puppeteer setViewport');
                await page.setViewport({ isMobile: false, width: 1920, height: 1080 });

                console.log('puppeteer setDefaultNavigationTimeout to 60s');
                page.setDefaultNavigationTimeout(60000);

                page.on('response', async response => {
                    if (response.request().resourceType() !== 'xhr'){
                        return;
                    }
                    const textBody = await response.text();
                    const url = response.url();
                    console.log(`url: ${url}`);
                    console.log(textBody);
                    try {
                        // parse balance
                        // const netBalance = JSON.parse(textBody).mojo
                        // if (typeof netBalance === 'number') {
                        //     console.log(`url: ${url}`);
                        //     console.log(textBody);
                        //     results.balance = netBalance / 1000000000000;  // price unit: mojo
                        // }
                        // // parse price
                        // if (JSON.parse(textBody).price) {
                        //     console.log(`url: ${url}`);
                        //     console.log(textBody);
                        //     results.price = JSON.parse(textBody).price;
                        // }

                        if (url.indexOf('/api/chia/blockchain/address') >= 0) {
                            const body = JSON.parse(textBody);
                            if (body.hasOwnProperty('balance')) {
                                results.balance = parseFloat(body.balance);
                            }
                        }
                    } catch (e) {
                        // console.error(e.stack || e);
                    }
                });

                page.on('error', err => {
                    console.error('Puppeteer error.', err);
                });

                console.log(`puppeteer goto page: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle0' });

                console.log('sleep 2s');
                await Utils.delay(2000);

                // await page.screenshot({ path: 'example.png' });

                console.log('puppeteer page.close');
                await page.close();

                console.log('puppeteer browser.close');
                await browser.close();

                resolve(results);

            } catch (e) {
                console.error('------------ puppeteer crawl failed -------------');
                console.error(e.stack || e);
                if (page) {
                    await page.close();
                }
                if (browser) {
                    await browser.close();
                }
                resolve(results);
            }
        });
    }

    /**
     * get current price of xch
     */
    async crawlPrice() {
        let price = 0;
        try{
            const res = await request.get(this.pricePrefix).timeout(10 * 1000).retry(3);
            console.info(res.text);
            price = res.body.price;
        }catch(e){
            console.error(e.stack || e);
        }
        return price;
    }

    compareBalance(account, balance) {
        let register = false;
        let diff = false;
        let from = -1;
        let to = -1;
        if (!account.history.length) {
            // register
            register = true;
            diff = true;
            from = 0;
            to = balance;
        } else {
            // get last balance
            const lastBalance = account.history[account.history.length - 1].balance;
            if (balance !== lastBalance) {
                diff = true;
                from = lastBalance;
                to = balance;
            }
        }
        return { register, diff, from, to };
    }

    /**
     * use markdown style
     */
    async sendNotification(register, account, price, from, to) {
        let title = `Watching wallet success`;
        const detailUrl = this.pagePrefix + account.wallet;
        let content = `You have watching wallet <*${account.wallet}*> successful.

xch price: $${parseInt(price)}.
        
__[view detail](${detailUrl})__.

os: ${os.platform()}/${os.arch()}.

time: ${new Date().toLocaleString()}.`;
        
        if (!register) {
            title = `Chia wallet changed`;
            content = `Your wallet <*${account.wallet}*>'s balance has changed.
            
from ${from} to ${to}.
            
xch price: $${parseInt(price)}.
            
__[view detail](${detailUrl})__.

os: ${os.platform()}/${os.arch()}.

time: ${new Date().toLocaleString()}.`;
        }

        for await (const receiver of account.notifier.wechat) {
            if (receiver.enable) {
                await wechat.sendMessage(receiver.sckey, title, content);
            }
        }
        for await (const receiver of account.notifier.telegram) {
            if (receiver.enable) {
                await telegram.sendMessage(receiver.token, receiver.chat_id, content);
            }
        }
    }

}

export const tracker = new Tracker();
