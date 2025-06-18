// Third-Party Imports:
import axios from 'axios';

// Local Imports:
import watchedMovies from '../Models/WatchedMoviesModel.js';
import likedMovies from '../Models/LikedMoviesModel.js';

export async function fetchRawMovies(url) {
    const rawMovies = [];

    try {
        const response = await axios.get(url);
        const data = response.data.response.docs;
        rawMovies.push(...data);
    } catch (error) {
        console.error('ERROR:', error);
        return null;
    }

    return rawMovies;
}

export async function getMovieData(rawMovie, movieGenres) {
    const { TMDB_API_KEY } = process.env;

    const year = rawMovie.year ? `&year=${rawMovie.year}` : '';
    const TMDBSearchURL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${rawMovie.title}${year}`;
    try {
        const tmdbResponse = await axios.get(TMDBSearchURL);

        const movieData = tmdbResponse.data.results[0];
        if (!movieData) return null;
        if (!movieData.poster_path) return null;
        const thumbnail = `https://image.tmdb.org/t/p/w185${movieData.poster_path}`;

        const genres = movieData.genre_ids.map(
            (genre_id) => movieGenres[genre_id] || 'Unknown'
        );

        const movie = {
            tmdb_id: movieData.id,
            title: movieData.original_title || 'N/A',
            year:
                parseInt(rawMovie.year) ||
                parseInt(movieData.release_date.slice(0, 4)),
            genres: genres,
            description: movieData.overview || 'N/A',
            rating: movieData.vote_average || 0,
            thumbnail: thumbnail || 'N/A',
            language: movieData.original_language,
            popularity: movieData.popularity,
            torrent_url: rawMovie.identifier
                ? `https://archive.org/download/${rawMovie.identifier}/${rawMovie.identifier}_archive.torrent`
                : rawMovie.torrent_url,
        };
        return movie;
    } catch (error) {
        console.error('ERROR:', error);
        return null;
    }
}

export async function getWatchAndLikeStatus(userId, movies) {
    for (const movie of movies) {
        const isWatched = await watchedMovies.isMovieWatched(userId, movie.id);
        movie.isWatched = isWatched;
        const isLiked = await likedMovies.isMovieLiked(userId, movie.id);
        movie.isLiked = isLiked;
    }
}

export function getSearchValues(userQuery) {
    const searches = {
        title: userQuery.title,
        year: userQuery.year,
        language: userQuery.language,
        genres: userQuery.genres,
    };

    let values = [];
    let searchQueries = '';
    for (const key in searches) {
        if (searches[key]) {
            const search = searches[key];
            if (key === 'genres' && Array.isArray(search)) {
                let genreConditions = [];
                for (const genre of search) {
                    values.push(genre);
                    genreConditions.push(`$${values.length} ILIKE ANY(genres)`);
                }
                if (searchQueries) searchQueries += ' AND ';
                searchQueries += `(${genreConditions.join(' OR ')})`;
            } else {
                values.push(`%${search}%`);
                if (searchQueries) searchQueries += ' AND ';
                const field = key != 'year' ? key : 'CAST(year AS TEXT)';
                const arrayOperator =
                    key !== 'genres'
                        ? `$${values.length}`
                        : `ANY($${values.length})`;
                searchQueries += `${field} ILIKE ${arrayOperator}`;
            }
        }
    }

    const result = {
        values: values,
        searchQueries: searchQueries,
    };
    return result;
}

export function getMoviesOrder(order) {
    const VALID_ORDERED_BY_FIELDS = [
        'title',
        'year',
        'rating',
        'popularity',
        'language',
    ];
    const orderedBy = order ? order : 'title';
    if (orderedBy && !VALID_ORDERED_BY_FIELDS.includes(orderedBy)) return null;
    return orderedBy;
}

export async function getMovieGenres() {
    const { TMDB_API_KEY } = process.env;
    const TMDBGenresURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en`;
    const movieGenres = {};

    try {
        const tmdbResponse = await axios.get(TMDBGenresURL);

        const genresData = tmdbResponse.data.genres;
        for (const genreData of genresData) {
            movieGenres[genreData.id] = genreData.name;
        }
        return movieGenres;
    } catch (error) {
        console.error('ERROR:', error);
        return null;
    }
}

export function getOrderType(orderType) {
    const VALID_ORDERS = ['ASC', 'DESC'];
    if (!orderType) return 'DESC';
    if (!VALID_ORDERS.includes(orderType)) return null;
    return orderType;
}

export function invalidSearchQuery(query) {
    const VALID_PARAMS = [
        'title',
        'year',
        'language',
        'genres',
        'orderedBy',
        'orderType',
    ];

    for (const key in query) {
        if (!VALID_PARAMS.includes(key)) return true;
        if (key === 'genres') {
            if (!Array.isArray(query[key])) return true;
        } else {
            if (typeof query[key] !== 'string') return true;
            if (key === 'orderType' && !getOrderType(query[key])) return true;
            if (key === 'orderedBy' && !getMoviesOrder(query[key])) return true;
        }
    }

    return false;
}
