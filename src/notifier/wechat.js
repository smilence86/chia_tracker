import request from 'superagent';

class Wechat{

    constructor () {

    }

    async sendMessage(wallet, register, sckey, from, to) {
        const now = new Date();
        let title = `Watching wallet success`;
        let content = `You have watching this wallet [${wallet}] successful,  Have a nice day!`;
        if (!register) {
            title = `Your wallet's balance has changed, from ${from} to ${to}.`;
            content = `Your wallet [${wallet}]'s balance has changed, from ${from} to ${to}.`;
        }
        try {
            const url = `https://sctapi.ftqq.com/${sckey}.send`;
            // console.info(url);
            const res = await request.post(url)
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({
                    text: title,
                    desp: content
                }).timeout(10 * 1000);
            console.log(res.text);
        } catch (e) {
            console.info(`------------- send to wechat failed ${now} --------------`);
            console.info(`title: ${title}`);
            console.error(e.stack || e);
        }
    }

}

export const wechat = new Wechat();
