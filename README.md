# Sites Admin Prototype

A GOV.UK Prototype Kit prototype for exploring how Local Planning Authorities
could manage a Call for Sites form, team access and site submissions. It is
intended for design exploration and user testing, not production use.

## Run locally

1. Install Node.js and npm.
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
or in a local `.env` file, then restart the server. Map requests are proxied
through the application so the key stays on the server and is not included in
the page or browser requests. Keep the key out of source control. The map is
optional; the submission details remain available without it.

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
