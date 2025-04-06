# Publishing to NPM

This project is set up to automatically publish to NPM when changes are pushed to the main branch. Here's how it works and how to configure it:

## Automatic Publishing via GitHub Actions

The GitHub Actions workflow automatically publishes a new version of the package to NPM when:

1. All tests pass
2. Code is pushed to the `main` branch

### Version Strategy

The workflow determines which version to bump (major, minor, patch) based on commit messages:

- If the commit message contains `[major]`, a major version bump will be applied
- If the commit message contains `[minor]`, a minor version bump will be applied
- Otherwise, a patch version bump will be applied

Examples:

- `git commit -m "Completely redesigned API [major]"` -> bumps 1.2.3 to 2.0.0
- `git commit -m "Added new features [minor]"` -> bumps 1.2.3 to 1.3.0
- `git commit -m "Fixed a bug"` -> bumps 1.2.3 to 1.2.4

## Setting up NPM Authentication

To allow GitHub Actions to publish to NPM, you need to set up an NPM token:

1. Generate an NPM access token:

   - Go to your NPM account settings (https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
   - Click "Generate New Token" (select "Automation" type)
   - Copy the generated token

2. Add the token to GitHub repository secrets:
   - In your GitHub repository, go to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: paste your NPM token
   - Click "Add secret"

## Manual Publishing

If you need to publish manually:

```bash
# Make sure you're logged in to NPM
npm login

# Run the publish command
yarn publish --access public
```

## Package Information

- Package name: `@zwidekalanga/svelte-logviewer`
- Public access: Yes (this is required for scoped packages)
- Registry: npmjs.org
