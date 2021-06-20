import CronJob from 'cron';
import { tracker } from './src/tracker.js';

const job = new CronJob.CronJob('0 */5 * * * *', async () => {
    await tracker.start();
}, null, true);
job.start();
console.info('Job started.');
