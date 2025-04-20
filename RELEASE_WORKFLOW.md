# Release Workflow Documentation

This document explains the release workflow for the Svelte LogViewer package.

## Overview

The release process has been updated to address the following requirements:

1. Productionized the demo pages (`src/routes/+page.svelte` and `src/routes/+layout.svelte`)
2. Ensured only necessary files are included in the npm package
3. Fixed the GitHub Actions permissions issue that was preventing the creation of pull requests
4. Made the release workflow manually triggerable and dependent on the CI pipeline

## NPM Package Contents

The package is configured to include only the necessary files:

- Only the `dist` directory is included in the npm package
- Test files (`*.test.*` and `*.spec.*`) are explicitly excluded
- This follows the standard practice for Svelte component libraries

This configuration is defined in the `files` field in `package.json`:

```json
"files": [
  "dist",
  "!dist/**/*.test.*",
  "!dist/**/*.spec.*"
]
```

## Release Workflow

### GitHub Actions Permissions Issue

The previous workflow was failing with the error:

```
Error: GitHub Actions is not permitted to create or approve pull requests.
```

This has been fixed by:

1. Using a Personal Access Token (PAT) instead of the default GITHUB_TOKEN
2. Making the workflow manually triggerable instead of automatic

### How to Use the New Release Workflow

There are now two ways to trigger the release process:

#### Option 1: Directly from the GitHub Actions UI

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Changesets" workflow
3. Click "Run workflow"
4. Choose whether to publish to npm or just create a release PR
5. Click "Run workflow"

#### Option 2: As part of the CI pipeline

1. Go to the "Actions" tab in your GitHub repository
2. Select the "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Check "Trigger release workflow after CI completes"
5. Optionally check "Publish to npm" if you want to publish immediately
6. Click "Run workflow"

The release workflow will only run if the CI pipeline completes successfully.

## Required Secrets

For the workflows to function properly, you need to set up the following secrets in your GitHub repository:

1. `GH_PAT`: A GitHub Personal Access Token with the `repo` scope
2. `NPM_TOKEN`: An NPM token with publish permissions

### Setting up the GH_PAT

1. Go to your GitHub account settings
2. Select "Developer settings" > "Personal access tokens" > "Tokens (classic)"
3. Generate a new token with the `repo` scope
4. Add this token as a repository secret named `GH_PAT`

## Demo Pages

The demo pages have been updated to showcase the LogViewer component:

- `src/routes/+page.svelte`: Shows a demo of the LogViewer component with example logs, installation instructions, and usage examples
- `src/routes/+layout.svelte`: Provides a clean, professional layout with navigation links to GitHub and NPM

These pages are used for development and demonstration purposes but are not included in the npm package.
