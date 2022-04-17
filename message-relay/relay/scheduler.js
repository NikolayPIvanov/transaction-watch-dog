const cronScheduler = require('cron');

const start = async (broker, cron, handler) => {
  const job = new cronScheduler.CronJob(cron, async () => handler(broker));
  job.start();
};

module.exports = start;
