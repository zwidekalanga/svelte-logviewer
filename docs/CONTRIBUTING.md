# Contributing to Svelte LogViewer

Thank you for considering contributing to Svelte LogViewer! This document provides guidelines and instructions for contributing to the project.

## Development Workflow

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/svelte-logviewer.git`
3. Install dependencies: `yarn install`
4. Create a new branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run tests: `yarn test`
7. Create a changeset: `yarn changeset` (see below)
8. Commit your changes: `git commit -m "Add your feature"`
9. Push to your fork: `git push origin feature/your-feature-name`
10. Create a pull request

## Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

### Adding a Changeset

When you make a change that needs to be published, run:

```bash
yarn changeset
```

This will prompt you to:

1. Select which packages you want to include in the changeset
2. Choose the type of version bump (patch, minor, major)
3. Write a summary of the changes

A new markdown file will be created in the `.changeset` directory. Commit this file along with your changes.

### Version Bump Types

- **patch**: Bug fixes and minor changes that don't affect the API
- **minor**: New features that don't break backward compatibility
- **major**: Breaking changes

## Code Style

- We use ESLint and Prettier for code formatting
- Run `yarn lint` to check for linting issues
- Run `yarn format` to automatically fix formatting issues

## Testing

Please ensure your changes include appropriate tests:

```bash
# Run unit tests
yarn test:unit

# Run end-to-end tests
yarn test:e2e

# Run package structure tests
yarn test:package

# Run all tests
yarn test
```

## Pull Request Process

1. Ensure your code passes all tests
2. Update the README.md with details of changes if appropriate
3. Include a changeset file describing your changes
4. The PR will be merged once it receives approval from maintainers

## CI/CD Pipeline

Our CI/CD pipeline automatically:

1. Runs linting and type checking
2. Builds the package
3. Runs unit tests and E2E tests in parallel
4. Builds and deploys documentation (for pushes to main)
5. Publishes to npm (for pushes to main with changesets)

## Documentation

If your changes include new features or API changes, please update the documentation:

1. Update the README.md if appropriate
2. Add or update Storybook stories for new components or features
3. Update TypeScript type definitions

## Questions?

If you have any questions or need help, please open an issue or reach out to the maintainers.

Thank you for contributing to Svelte LogViewer!
