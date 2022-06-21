import config from 'config';
import CronJob from 'cron';
import { tracker } from './src/tracker.js';

const interval = config.get('interval') || 10;  // unit: minutes

const job = new CronJob.CronJob(`0 */${interval} * * * *`, async () => {

    await tracker.start();

}, null, true);

job.start();

console.info('Job started.');
