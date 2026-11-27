# MedTracker

A small, static browser-local log. Add the date, location, and amount for each entry. The dose field starts blank and then prefills from the newest dated entry. You can change it before each save.

Entries live in the current browser profile's site storage. Clearing site data removes the log. The app has no backend, analytics, or external assets.

## Run locally

Serve this folder with a static file server, such as `python3 -m http.server 3000`, and open `http://localhost:3000`.

## GitHub Pages

In **Settings → Pages**, select **Deploy from a branch** and choose **main** and **/ (root)**. No build step is needed.
