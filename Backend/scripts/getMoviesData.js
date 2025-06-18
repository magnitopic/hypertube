// Third-Party Imports:
import axios from 'axios';
import { getPublicDomainTorrentsMovies } from './getPublicDomainTorrentsMovies.js';
import { getArchiveMovies } from './getArchiveMovies.js';
import { getMovieGenres } from '../src/Utils/moviesUtils.js';

// Local Imports:
import moviesModel from '../src/Models/MoviesModel.js';

async function getMoviesData() {
    const movieGenres = await getMovieGenres();

    if (await areMoviesInDB()) {
        console.info('The DB already has movies.');
        process.exit();
    }
    await getArchiveMovies(movieGenres);
    await getPublicDomainTorrentsMovies(movieGenres);
}

async function areMoviesInDB() {
    const result = await moviesModel.countRecordsInTable();
    if (result > 0) return true;
    return false;
}

await getMoviesData();
process.exit();
