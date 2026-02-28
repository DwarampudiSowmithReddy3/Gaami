# Gaami Travel Planner

A comprehensive, full-stack application designed to orchestrate seamless travel experiences, handling transport, stay, location details, and budgeting in one centralized interface.

## Quick Start

### 1. Install Global Dependencies
Installs the necessary root packages for running the application modules at the same time:
```bash
npm install
```

### 2. Install Sub-Module Dependencies
Ensure the packages inside of your frontend and your backend have been properly downloaded:
```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Start the Application
You do **not** need to open two terminals. A single start command at the root will automatically boot both the frontend client and the backend JSON-Server simultaneously:
```bash
npm start
```

## Features & Services

*   **Live Background Rendering**: Automatically leverages the Wikipedia open API to dynamically load background image/video loops of destination cities.
*   **Geocoding Search**: Real-time city search predictions powered by the OpenStreetMap/Nominatim API.
*   **Comprehensive Data**: Extensive dataset integration mapping interconnected transport (Buses, Trains, Flights), Hotels, Food, and Activities natively.
*   **Authentication**: Secure client-side routing, user accounts, and password reset handling powered by **Firebase**.

## Project Structure

```text
gaami/
├── backend/            # Express.js REST API
│   ├── data/           # High-volume local JSON travel databases
│   └── routes/         # Modular endpoint routing
├── frontend/           # Vanilla JS, HTML, CSS UI client
│   ├── assets/         # App videos and logo images
│   ├── css/            # UI components and global stylesheets
│   ├── js/             # Local storage handling, Firebase Auth, API fetching
│   └── pages/          # HTML templates for travel and auth workflows
├── package.json        # Unified root configurations
└── start.js            # Cross-platform multi-process Node startup script
```

## Tech Stack

*   **Frontend**: HTML5, Vanilla JavaScript, CSS3
*   **Mapping**: Leaflet.js
*   **Backend API**: Node.js + Express.js
*   **Database**: Extensive Local JSON Network (`/data`)
*   **Identity Provider**: Google Firebase Auth
