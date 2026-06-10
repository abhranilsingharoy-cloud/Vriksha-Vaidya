# Contributing to Vriksha Vaidya

First off, thank you for considering contributing to Vriksha Vaidya! It's people like you that make open source such a great community to learn, inspire, and create.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) tab first to see if someone else has already created a ticket. If not, go ahead and make one!

## Fork & create a branch

If this is something you think you can fix, then fork Vriksha Vaidya and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-disease-class
```

## Implementation Guidelines

Since Vriksha Vaidya is built using a strict Vanilla architecture without heavy frontend frameworks:
- **No Build Steps**: Do not add dependencies that require compilation (like Webpack, Babel, etc.) unless absolutely necessary and previously discussed in an Issue.
- **CSS Variables**: Follow the design system by utilizing the CSS variables in `css/variables.css`.
- **Vanilla ES6 Modules**: Continue to separate logic using ES6 imports/exports in the `js/` directory.

## Commit Guidelines

We recommend using conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting/CSS changes
- `refactor:` for code refactoring

## Pull Requests

1. Commit your changes and push your branch to GitHub.
2. Open a Pull Request against the `main` branch.
3. In the PR description, explain clearly what the PR fixes or adds. Include screenshots if your PR introduces visual changes.

Once your PR is submitted, it will be reviewed by the maintainers. Thank you for your contribution!
