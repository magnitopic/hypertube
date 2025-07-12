# hypertube

Video streaming webpage for torrents

# API

The REST API for this project allows users to interact with the application using HTTP requests. It allows for all the same operations that could be performed through the web interface, such as managing user profiles, gathering movie information, and comment management as well as BONUS endpoints.

> _NOTE:_ All endpoints follow the base route of `/api/v1/`

## Mandatory

![POST](https://img.shields.io/badge/POST-orange) `/oauth/token`  
Expects client + secret, returns an auth token

![GET](https://img.shields.io/badge/GET-blue) `/users`  
returns a list of users with their id and their username

![GET](https://img.shields.io/badge/GET-blue) `/users/:id`  
returns username, email address, profile picture URL

![PATCH](https://img.shields.io/badge/PATCH-yellow) `/users/:id`  
Expected data : username, email, password, profile picture URL

![GET](https://img.shields.io/badge/GET-blue) `/movies`  
returns the list of movies available on the frontpage, with their id and their name

![GET](https://img.shields.io/badge/GET-blue) `/movies/:id`  
returns a movie’s name, id, IMDb (OMDb or TMDb for free API) mark, production year, length, available subtitles, number of comments

![GET](https://img.shields.io/badge/GET-blue) `/comments`  
returns a list of latest comments which includes comment’s author username, date, content, and id.

![GET](https://img.shields.io/badge/GET-blue) `/comments/:id`  
returns comment, author’s username, comment id, date posted

![PATCH](https://img.shields.io/badge/PATCH-yellow) `/comments/:id`  
Expected data : comment, username

![DELETE](https://img.shields.io/badge/DELETE-red) `/comments/:id`

![POST](https://img.shields.io/badge/POST-orange) `/comments` `/movies/:movie_id/comments`  
Expected data: comment, movie_id. Rest is filled by the server

## Bonus

### Authentication

![GET](https://img.shields.io/badge/GET-blue) `/auth/status`  
returns authentication status of the current user

![POST](https://img.shields.io/badge/POST-orange) `/auth/login`  
Expected data: username, password. Returns authentication token

![POST](https://img.shields.io/badge/POST-orange) `/auth/register`  
Expected data: username, email, password, firstName, lastName. Creates new user account

![POST](https://img.shields.io/badge/POST-orange) `/auth/logout`  
logs out the current user

![POST](https://img.shields.io/badge/POST-orange) `/auth/password/change`  
Expected data: oldPassword, newPassword. Changes user password

### Movie Features

![GET](https://img.shields.io/badge/GET-blue) `/movies/genres`  
returns list of available movie genres

![GET](https://img.shields.io/badge/GET-blue) `/movies/random`  
returns a random movie

![GET](https://img.shields.io/badge/GET-blue) `/movies/:id/subtitles`  
returns available subtitles for a movie

![GET](https://img.shields.io/badge/GET-blue) `/movies/search/:page?`  
returns paginated search results for movies

![POST](https://img.shields.io/badge/POST-orange) `/movies/:id/watched`  
marks movie as watched or updates watch progress

![POST](https://img.shields.io/badge/POST-orange) `/movies/:id/like`  
toggles like status for a movie
