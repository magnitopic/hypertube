import fs from 'fs-extra';
import dayjs from 'dayjs';
import db from '../src/Utils/dataBaseConnection.js';

export default async function cleanup() {
  try {
    const oneMonthAgo = dayjs().subtract(1, 'month').toISOString();

    // Previously watched movies, but not watched last month
    const query = `
      SELECT movie_id
      FROM watched_movies
      WHERE downloaded = TRUE
      GROUP BY movie_id
      HAVING MAX(watched_at) < $1
    `;

    const res = await db.query(query, [oneMonthAgo]);

    const movieIds = res.rows.map(row => row.movie_id);
    console.log(`Found ${movieIds.length} movies to delete.`);

    for (const movieId of movieIds) {
      const basePath = `/downloads/movies/${movieId}`;
      const mp4Path = `${basePath}.mp4`;
      const torrentPath = `${basePath}.torrent`;
      const folderPath = basePath;

      // Delete from local dir
      await fs.remove(mp4Path);
      await fs.remove(torrentPath);
      await fs.remove(folderPath);

      console.log(`Deleted files for movie ID: ${movieId}`);
    }

    if (movieIds.length > 0) { // Delete from DB
      await db.query(
        `UPDATE watched_movies SET downloaded = FALSE WHERE movie_id = ANY($1)`,
        [movieIds]
      );
      console.log(`Deleted ${movieIds.length} records from watched_movies.`);
    } else {
      console.log('No records to delete from watched_movies.');
    }

    console.log('✅ Cleanup finished!');
  } catch (err) {
    console.error('❌ Error running cleanup:', err);
  } 
}
