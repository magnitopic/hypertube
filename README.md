# Hypertube 📺

A full-stack torrent streaming website that allows users to discover, watch, and engage with movies. Built with modern web technologies leveraging real-time capabilities, OAuth authentication, and intelligent media processing.

<img width="1920" height="1080" alt="Screenshot 2025-07-16 at 19-37-18 Hypertube" src="https://github.com/user-attachments/assets/44cfea95-9fb4-46d9-8066-a76834dd5cf4" />

## Features 🌟

### 🎥 **Streaming & Media Processing**

-   **Real-time torrent streaming** with custom TorrentClient implementation
-   **Automatic video conversion** to MP4 using FFmpeg for browser compatibility
-   **Progressive download** with range requests for seamless playback
-   **Multi-language subtitle support** (SRT, ASS, VTT) with automatic conversion
-   **Intelligent file detection** prioritizing MP4 format for optimal streaming

### 🔐 **Authentication & Security**

-   **Multi-provider OAuth integration** (Google, GitHub, Twitch, 42)
-   **JWT-based authentication** with access and refresh tokens
-   **Email confirmation** system with secure token validation
-   **Password reset** functionality with time-limited tokens
-   **Session management** with httpOnly cookies and CSRF protection

### 💬 **Social Features**

-   **Movie commenting** system
-   **User profiles** with customizable avatars and bios
-   **Watch history tracking** on your movie library
-   **Community interaction** through comments and likes

### 🎯 **Smart Movie Discovery**

-   **Advanced search** with filters (genre, year, rating, popularity)
-   **Automatic metadata fetching** from TMDB API
-   **Genre-based categorization**
-   **Pagination** for efficient content loading
-   **Random movie button** for surprise selections

### 🛠️ **Infrastructure & DevOps**

-   **Containerized deployment** with Docker Compose
-   **Automated movie cleanup** with cron jobs (removes old downloads)
-   **Database migrations** and fixtures
-   **Development and production** environments

## Tech Stack 🚀

### **Frontend**

-   **React 18** with TypeScript
-   **Vite** for fast development and building
-   **Tailwind CSS** for modern, responsive styling
-   **React Router DOM** for client-side routing

### **Backend**

-   **Node.js** with Express.js
-   **PostgreSQL** for data storage
-   **FFmpeg** for video/subtitle processing
-   **Custom TorrentClient** for streaming implementation

Each service of the project runs in it's own Docker container with docker-compose in three isolated containers:

-   **NodeJS** (API and backend) ⚙️
-   **Postgres** (database) 🗄️
-   **React - Vite** (frontend) 🌐

## **Custom Torrent Client**

The application features a sophisticated torrent streaming system that:

-   Downloads and parses torrent files using bencode
-   Utilizes web seeds for HTTP-based streaming
-   Implements progressive downloading with range requests
-   Converts different video formats to MP4 on-the-fly
-   Manages concurrent downloads and streaming efficiently

# Team work 💪

This project was a team effort. You can checkout the team members here:

-   **Alejandro Díaz Ufano Pérez**
    -   [Github](https://github.com/adiaz-uf)
    -   [LinkedIn](https://www.linkedin.com/in/alejandro-d%C3%ADaz-35a996303/)
    -   [42 intra](https://profile.intra.42.fr/users/adiaz-uf)
-   **Alejandro Aparicio**
    -   [Github](https://github.com/magnitopic)
    -   [LinkedIn](https://www.linkedin.com/in/magnitopic/)
    -   [42 intra](https://profile.intra.42.fr/users/alaparic)

# Run project

Using docker-compose you can run the project with the following setup:

```bash
git clone https://github.com/magnitopic/hypertube.git

cd hypertube

cp .example.env .env

#Enter values for the variables in the .env file
vim .env

make
```

Once the project is running you can access the web page at [localhost:3000](http://localhost:3000) and the API at [localhost:3001/api/v1/](http://localhost:3001/api/v1/).

# API

The REST API for this project allows users to interact with the application using HTTP requests. It enables all the same operations as the web interface, such as managing user profiles, gathering movie information, and comment management as well as BONUS endpoints.

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

# Project Gallery

<img width="3840" height="2160" alt="hypertube_subtitles" src="https://github.com/user-attachments/assets/0f951d34-73ba-4ad6-a6a1-ccc85b199078" />

_watching movie with subtitles_

---

<img width="1920" height="1080" alt="Screenshot 2025-07-16 at 19-36-33 Hypertube" src="https://github.com/user-attachments/assets/3d6068e0-4fc5-4e2f-bbcc-7f21ce40287b" />

_comments and movies information_

---

<img width="1920" height="1080" alt="Screenshot 2025-07-16 at 19-40-09 Hypertube" src="https://github.com/user-attachments/assets/7e74acdf-1813-4174-8b9d-069ceb1ca8c1" />

_user profile_

---

<img width="1920" height="1080" alt="Screenshot 2025-07-16 at 19-37-18 Hypertube" src="https://github.com/user-attachments/assets/5a80ce71-d9fa-49b2-b0b7-f419a0b5538c" />

_movie library_

---

<img width="1920" height="1080" alt="Screenshot 2025-07-16 at 19-37-50 Hypertube" src="https://github.com/user-attachments/assets/e5f5f11b-a09a-44d4-afd1-9e3dd8d540d6" />

_library search and sorting_
