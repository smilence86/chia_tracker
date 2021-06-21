import request from 'superagent';

class Telegram{

    constructor () {

    }

    async sendMessage(token, chat_id, content) {
        const now = new Date();
        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            // console.info(url);
            const res = await request.post(url)
                .set('Content-type', 'application/x-www-form-urlencoded')
                .send({
                    chat_id: chat_id,
                    text: content
                }).timeout(10 * 1000).retry(5);
            console.log(res.text);
        } catch (e) {
            console.info(`------------- send to telegram failed ${now} --------------`);
            console.info(`chat_id: ${chat_id}`);
            console.info(`content: ${content}`);
            console.error(e.stack || e);
        }
    }

}

export const telegram = new Telegram();
