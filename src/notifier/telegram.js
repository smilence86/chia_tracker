import request from 'superagent';

class Telegram{

    constructor () {

    }

    async sendMessage(wallet, register, token, chat_id, from, to) {
        const now = new Date();
        let content = `You have watching this wallet [${wallet}] successful,  Have a nice day!`;
        if (!register) {
            content = `Your wallet [${wallet}]'s balance has changed, from ${from} to ${to}.`;
        }
        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            // console.info(url);
            const res = await request.post(url)
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({
                    chat_id: chat_id,
                    text: content
                }).timeout(10 * 1000);
            console.log(res.text);
        } catch (e) {
            console.info(`------------- send to telegram failed ${now} --------------`);
            console.info(`content: ${content}`);
            console.error(e.stack || e);
        }
    }

}

export const telegram = new Telegram();
