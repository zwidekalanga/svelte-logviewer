# Publishing to NPM

This project is set up to automatically publish to NPM when changes are pushed to the main branch.
Here's how it works and how to configure it:

## Project Structure

The component library is structured following SvelteKit component library best practices:

- `src/lib/` - Contains all component source code
  - `src/lib/components/` - Component implementations
  - `src/lib/types/` - TypeScript type definitions
  - `src/lib/utils/` - Utility functions
  - `src/lib/index.ts` - Main entry point for exporting components and types

When built, the library is packaged into the `dist/` directory with the following structure:

- `dist/index.js` - Main entry point for the library
- `dist/index.d.ts` - TypeScript declarations
- `dist/components/` - Built components
- `dist/types/` - Type definitions
- `dist/utils/` - Utility functions

## Importing the Library

The library is configured for easy consumption in other SvelteKit or Svelte projects:

```js
// Import the main component
import { LogViewer } from '@zwidekalanga/svelte-logviewer';

// Import specific component directly (if needed)
import { LogViewer } from '@zwidekalanga/svelte-logviewer/dist/components/log-viewer';

// Import types
import type { LogViewerProps } from '@zwidekalanga/svelte-logviewer';
```

## Automatic Publishing via GitHub Actions

The GitHub Actions workflow automatically publishes a new version of the package to NPM when:

1. All tests pass
2. Code is pushed to the `main` branch

### Version Strategy

The workflow uses a robust versioning strategy:

1. It checks the latest version published on NPM
2. It ensures the local version matches the published version
3. It then determines which version to bump (major, minor, patch) based on commit messages:
   - If the commit message contains `[major]`, a major version bump will be applied
   - If the commit message contains `[minor]`, a minor version bump will be applied
   - Otherwise, a patch version bump will be applied

This ensures we never encounter "version already exists" errors during publishing.

Examples:

- `git commit -m "Completely redesigned API [major]"` -> bumps 1.2.3 to 2.0.0
- `git commit -m "Added new features [minor]"` -> bumps 1.2.3 to 1.3.0
- `git commit -m "Fixed a bug"` -> bumps 1.2.3 to 1.2.4

## Setting up NPM Authentication

To allow GitHub Actions to publish to NPM, you need to set up an NPM token:

1. Generate an NPM access token:

   - Go to your NPM account settings
     (https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
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
yarn npm login

# Check the latest published version
yarn npm view @zwidekalanga/svelte-logviewer version

# Build the package
yarn package

# Update your local version to match or exceed the published version
yarn version [new-version]

# Run the publish command
yarn publish --access public
```

## Troubleshooting

### Version Conflict Errors

If you see an error like:

```
error Couldn't publish package: "You cannot publish over the previously published versions: 0.0.2."
```

It means you're trying to publish a version that already exists. Our CI system has been improved to
handle this automatically, but if you need to fix it manually:

1. Check the current published version:

   ```
   yarn npm view @zwidekalanga/svelte-logviewer version
   ```

2. Update your local version to a higher number:

   ```
   yarn version [new-version] --no-git-tag-version
   ```

3. Publish again:
   ```
   yarn publish --access public
   ```

### GitHub Actions Publish Failures

If the GitHub Actions publish step fails, check:

1. Make sure the `NPM_TOKEN` secret is properly set in your repository
2. Verify the token has proper permissions on your NPM account
3. Check that the version in package.json is higher than what's on NPM
4. If needed, push a new commit with `[patch]`, `[minor]`, or `[major]` in the message to force a version bump

## Package Information

- Package name: `@zwidekalanga/svelte-logviewer`
- Public access: Yes (this is required for scoped packages)
- Registry: npmjs.org
