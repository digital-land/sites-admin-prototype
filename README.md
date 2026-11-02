# Sites Admin Prototype

A GOV.UK Prototype Kit prototype for exploring how Local Planning Authorities
could manage a Call for Sites form, team access and site submissions. It is
intended for design exploration and user testing, not production use.

## Run locally

1. Install Node.js 26 and npm. If you use nvm, run `nvm use` to pick up the
   version in `.nvmrc`.
2. Install the project dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open the local URL printed by the Prototype Kit, then choose a scenario from
   the prototype home page.

The prototype uses GOV.UK Frontend components and GOV.UK Prototype Kit. To
display site boundary maps, set `ORDNANCE_SURVEY_API_KEY` in your environment
or in a local `.env` file, then restart the server. The map is optional; the
submission details remain available without it.

## Deploy to Heroku

The `Procfile` starts the prototype with `npm start`, and `package.json` pins
Node.js 26 (LTS). Heroku sets `NODE_ENV=production` and `PORT` for you, so the
Prototype Kit turns on password protection and redirects to HTTPS.

Set these config vars are set in the Heroku app

| Name | Required | Purpose |
| --- | --- | --- |
| `PASSWORD` | Yes | Password participants enter to view the prototype. Without it the site shows an error page. |
| `ORDNANCE_SURVEY_API_KEY` | No | Shows site boundary maps on submission pages. |

The deployments are handled automatically by heroku on pushes to main

## Prototype behaviour and limitations

- Journey state is stored in the Prototype Kit session, so it is temporary and
  separate between sessions. Starting the form-creation scenario resets that
  session to its defaults.
- Logo uploads are held in memory in the current session, with a 5 MB limit;
  they are not saved as files.
- Submission downloads are simulations. The prototype displays a short
  processing state and updates which submissions are marked as downloaded; it
  does not generate CSV or GeoJSON files.
- Team access changes are prototype-only. No accounts are provisioned and no
  invitation emails are sent.

## Project structure

- `app/routes.js` — journey routes and session-backed prototype behaviour.
- `app/data/` — default session data, example submissions and map boundaries.
- `app/views/` — Nunjucks pages, layouts and shared macros.
- `app/assets/` — styles, JavaScript and images.
- `app/config.json` — service name and GOV.UK Frontend configuration.

## Design and contribution guidance

Pages should follow the GOV.UK Design System and use the GOV.UK Frontend
Nunjucks macros. Read [`.github/llms.txt`](.github/llms.txt) for the project’s
Frontend guidance and component references. User-testing scenarios,
hypotheses, and outcomes are documented on the prototype home page in
`app/views/index.html`.
