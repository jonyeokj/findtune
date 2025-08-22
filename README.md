# Findtune for Spotify

https://findtune.vercel.app/login

Findtune is a web application that helps you discover new music by leveraging Spotify's recommendation engine. Login with your Spotify account, select your favorite songs, and curate a playlist based on the seed tracks.

Due to Spotify’s deprecation of the Recommendations API (Nov 2024), automatic track recommendations are no longer available for new and development-mode apps. As a result, Findtune is no longer being reworked or maintained.

## Features

- **Personalized Recommendations**: Get recommendations based on your selected songs.
- **Spotify Webplayer SDK**: Listen to music in your browser, and the webplayer will fetch music continuously based on the seed tracks.
- **Playlist Save**: Like songs as findtune recommends them to you, and save them to your Spotify profile seamlessly.

## Tech Stack

- **Frontend**: React, with various libraries.
- **Backend**: Express.js, handling authentication and interaction with the Spotify API.
