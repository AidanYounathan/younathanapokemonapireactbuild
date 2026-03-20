**One Dex — Pokemon API (React + TypeScript)**

A modern, responsive rebuild of a Pokemon viewer that consumes the PokeAPI (https://pokeapi.co/). Built with React, TypeScript and Tailwind CSS — focused on a compact, accessible UI and performant data fetching.

**Quickstart**
- Install dependencies: `npm install`
- Start dev server (choose a free port if prompted): `npm start`
- Build for production: `npm run build`

**Features**
- Search Pokemon by name or id
- Random Pokemon selector and Shiny image toggle
- Evolution chain with thumbnails
- Favorites drawer (persisted to `localStorage`)
- Compact, responsive layout with fluid sizing and lightweight animations

**Tech**
- React 18 + TypeScript
- Tailwind CSS + PostCSS
- Flowbite UI utilities
- PokeAPI for data and sprites

**Notes**
- If the dev server reports a stale import error (TS2307) after file edits, stop the running `npm start` instance and restart on a fresh port (example: `$env:PORT=3003; npm start`).
- Favorite items are stored under the `Favorites` key in `localStorage`.

**Credits**
- Author: Aidan Younathan
- Peer review: Ellie Rasuli

Contributions and improvements welcome — open an issue or send a PR.