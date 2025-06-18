// Third-Party Imports:
import axios from 'axios';
import * as cheerio from 'cheerio';

// Local Imports:
import { getMovieData } from '../src/Utils/moviesUtils.js';
import moviesModel from '../src/Models/MoviesModel.js';

const BASE_URL = 'https://www.publicdomaintorrents.info';
const CATEGORY_URL = `${BASE_URL}/nshowcat.html?category=ALL`;

async function getMoviesURL() {
    try {
        const { data } = await axios.get(CATEGORY_URL);
        const $ = cheerio.load(data);
        const moviesURLs = [];

        $('tr td').each((_, element) => {
            const linkElement = $(element).find('a');
            if (
                linkElement.text().length < 55 &&
                linkElement.attr('href')?.includes('nshowmovie.html')
            ) {
                const movieURL = BASE_URL + '/' + linkElement.attr('href');
                moviesURLs.push(movieURL);
            }
        });

        return moviesURLs;
    } catch (error) {
        console.error('Scraping error:', error);
    }
}

async function scrapMovieData(movieURL) {
    try {
        const { data } = await axios.get(movieURL);
        const $ = cheerio.load(data);
        const scrapedMovieData = {};

        $('tr td h3').each((_, element) => {
            scrapedMovieData['title'] = $(element).text().trim();
        });

        $('tr td').each((_, element) => {
            const linkElement = $(element).find('a');
            if (linkElement.attr('href')?.includes('PSP.MP4.torrent')) {
                scrapedMovieData['torrent_url'] = linkElement.attr('href');
            }
        });

        return scrapedMovieData;
    } catch (error) {
        console.error('Scraping error:', error);
    }
}

async function saveMoviesData(moviesURLs, movieGenres) {
    let count = 1;
    for (const movieURL of moviesURLs) {
        if (count > process.env.MOVIES_LIMIT) return;
        const scrapedMovieData = await scrapMovieData(movieURL);
        const TMDBMovieData = await getMovieData(scrapedMovieData, movieGenres);
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

export async function getPublicDomainTorrentsMovies(movieGenres) {
    const moviesURLs = await getMoviesURL();

    await saveMoviesData(moviesURLs, movieGenres);
}
