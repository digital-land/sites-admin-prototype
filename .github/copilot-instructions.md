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

## GOV.UK Frontend

This project uses GOV.UK Frontend Nunjucks macros.

- Read `./llms.txt` for guidance on using language models in this project.
- Before building or changing a page, read `./docs/govuk/govuk-frontend-guide.md`.
- Before using a component, read its file in `./docs/govuk/components/` (for example `./docs/govuk/components/radios.md`). Use only the parameters listed there.
- Use the macros. Do not hand-write component HTML or invent parameters.
- Follow progressive enhancement. Every page and form must work without JavaScript, with server-side validation and no single-page app.
- For colours, spacing, typography and `govuk-!-` override classes, check `docs/govuk/govuk-frontend-styles.md`. Never hard-code hex colours.

## Git conventions (GDS Way)

Follow the GDS Way on working with git: https://gds-way.digital.cabinet-office.gov.uk/standards/source-code/working-with-git.html

- Start commit messages with a summary of 50 characters or fewer. Write it in the imperative ("Add date input to start page", not "Added…"), with a leading capital and no full stop.
- Leave a blank line, then write a body wrapped at about 72 characters that explains why the change was made, not just what changed.
- A ticket link is not a substitute for a message. The message must make sense on its own.
- Keep each commit atomic: one self-contained, logical step, in a sensible order. Prefer several small commits to one commit per pull request.
- Work on a short-lived feature branch, not on `main`. Update it with `git rebase`, not a merge commit.
- Never use `git push -f`. Use `--force-with-lease`, and do not rewrite commits that are already on `main`.