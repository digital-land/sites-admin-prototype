# Copilot Instructions for Sites Admin Prototype

## Background

This prototype is to explore designs for managing access and site submissions for the Submit a Site tool.

Local Planning Authorities will use this tool to create and publish their Call for Sites form.

The admin tool will give LPAs the ability to manage access for team members, add a locally specific question to the form, set up the branding customisation and view and download site submissions.

As a prototype, it is intended for design exploration and user testing rather than full production use. It may not include complete functionality or robust error handling.

## Instructions

Pages should follow the conventions and guidelines set out for this project.

Most pages will extend the main layout defined in `app/views/layouts/main.html`.

The `pageName` variable should be set to the title of the current page and displayed in the main heading.

The `serviceName` variable is set to the name of the service and displayed in the header.

The `mainNavActive` variable should be set to the key of the main navigation tab that corresponds to the current page.

Pages should use the GOV.UK Frontend Nunjucks macros for all components and follow the design system guidelines.

Pages should not include hard-coded HTML for GOV.UK components; always use the provided macros.

Images as guidance for page design should not be hard-coded; use the appropriate GOV.UK Frontend macros instead. Images used in this way are a guide and should not be interpreted with strict pixel precision.

Follow the GOV.UK Design System guidance for layout, typography, and component usage and only override if prompted.

User flows should be documented on the index page and iterations should be listed with the date they were created or updated, what has changed, what the hypotheses we are testing is and any outcomes or learnings from user testing.

## Working from designs

- Resolve questions about unclear content or behaviour before creating or editing code. Do not guess unreadable screenshot text; ask for individual page exports or close-ups.
- Match the wording in the designs, especially role descriptions. Reuse shared macros for repeated content so add and change journeys stay consistent.
- Use medium sizing for secondary question labels and legends: `govuk-label--m` and `govuk-fieldset__legend--m`. Keep the page heading at `govuk-heading-l`.
- Put management tables in a full-width column (`govuk-grid-column-full`) to accommodate longer content. Ensure long email addresses can wrap on smaller screens.
- Keep links within the current iteration, including service-name links back to its dashboard.

## GOV.UK Frontend

This project uses GOV.UK Frontend Nunjucks macros.

- Paths below are relative to the repository root.
- Read `.github/llms.txt` for guidance on using language models in this project.
- Before building or changing a page, read `.github/docs/govuk-frontend-guide.md`.
- Before using a component, read its file in `.github/docs/components/` (for example `.github/docs/components/radios.md`). Use only the parameters listed there.
- Use the macros. Do not hand-write component HTML or invent parameters.
- Follow progressive enhancement. Every page and form must work without JavaScript, using server-handled forms and real navigation links, not a single-page app.
- This is a prototype: do not add validation or error states unless explicitly requested. This overrides the general server-side validation guidance for this project.
- For colours, spacing, typography and `govuk-!-` override classes, check `.github/docs/govuk-frontend-styles.md`. Never hard-code hex colours.

## Prototype behaviour and checks

- Store journey data in the prototype session so additions and changes persist across pages without affecting other sessions. Do not build real account provisioning or email delivery unless requested.
- Show success banners once after an action, then clear them on subsequent visits.
- Check the full journey, including saved values, Cancel, relevant update/removal actions and narrow-screen layouts. Verify forms and navigation work without page JavaScript.
- Use the existing `npm run dev` command for local preview. Do not install new tooling just for checks that existing dependencies can perform.

## Git conventions (GDS Way)

Follow the GDS Way on working with git: https://gds-way.digital.cabinet-office.gov.uk/standards/source-code/working-with-git.html

- Start commit messages with a summary of 50 characters or fewer. Write it in the imperative ("Add date input to start page", not "Added…"), with a leading capital and no full stop.
- Leave a blank line, then write a body wrapped at about 72 characters that explains why the change was made, not just what changed.
- A ticket link is not a substitute for a message. The message must make sense on its own.
- Keep each commit atomic: one self-contained, logical step, in a sensible order. Prefer several small commits to one commit per pull request.
- Before each commit, show its proposed message and included changes, and wait for approval. Do not commit or push automatically after implementation.
- Work on a short-lived feature branch, not on `main`. Update it with `git rebase`, not a merge commit.
- Never use `git push -f`. Use `--force-with-lease`, and do not rewrite commits that are already on `main`.