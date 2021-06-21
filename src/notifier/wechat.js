import request from 'superagent';

class Wechat{

    constructor () {

    }

    async sendMessage(sckey, title, content) {
        const now = new Date();
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
            console.info(`content: ${content}`);
            console.error(e.stack || e);
        }
    }

}

export const wechat = new Wechat();
