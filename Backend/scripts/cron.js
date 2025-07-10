import cron from 'node-cron';
import cleanup from './deleteOldWatchedMovies.js';

// Every day at 00:42 AM
//              m-h-D-M-WD
cron.schedule('42 0 * * *', async () => {
  console.log('🧹 Running cleanup script...');
  await cleanup();
});