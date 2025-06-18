// Local Imports:

import moviesModel from '../src/Models/MoviesModel.js';
import { fetchRawMovies, getMovieData } from '../src/Utils/moviesUtils.js';

export async function getArchiveMovies(movieGenres) {
    const url = `https://archive.org/advancedsearch.php?q=collection%3Afeature_films+AND+mediatype%3Amovies+AND+date%3A%5B*+TO+2025-01-01%5D&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=identifier&sort%5B%5D=downloads+desc&output=json&rows=100&page=1`;

    const rawMovies = await fetchRawMovies(url);

    let count = 1;
    for (const rawMovie of rawMovies) {
        if (count > process.env.MOVIES_LIMIT) return;
        const TMDBMovieData = await getMovieData(rawMovie, movieGenres);
        if (!TMDBMovieData) continue;

        const isDuplicatedMovie = await moviesModel.isDuplicatedMovie(
            TMDBMovieData.tmdb_id
        );
        if (isDuplicatedMovie === null) {
            console.error(
                'There was a problem checking if movie is duplicated.'
            );
            return null;
        }
        if (isDuplicatedMovie) continue;

        await moviesModel.create({ input: TMDBMovieData });
        console.info(`${TMDBMovieData.title} has been added to the DB.`);
        count += 1;
    }
}
