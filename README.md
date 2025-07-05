# Obsidian JSON Canvas

A lightweight visual canvas interface inspired by Obsidian Canvas. Built with React, Vite, Three.js (via react-three-fiber) and packaged for easy deployment with Docker.

## Features

* Edit graph data as raw JSON.
* Real-time 3D visualisation of nodes and edges.
* Sidebar file manager (stored in browser `localStorage`).
* Fully static build suitable for any static host or CDN.

## Development

```bash
# install deps
npm install

# start dev server
npm run dev
```

Open http://localhost:5173 and start editing!

## Build

```bash
npm run build
```

The compiled static site will be in `dist/`.

## Docker

```bash
# build image
docker build -t obsidian-json-canvas .

# run container
docker run -it --rm -p 8080:80 obsidian-json-canvas
```

Navigate to http://localhost:8080.
