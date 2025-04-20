# Scripts

This directory contains utility scripts for the Svelte LogViewer project.

## trigger-release.sh

This script triggers the release process using the GitHub repository_dispatch event. It's designed to replace the previous workflow_dispatch inputs in the CI workflow, which were removed to address a security concern (CKV_GHA_7).

### Prerequisites

- A GitHub personal access token with the `repo` scope
- curl installed on your system

### Usage

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token

# Trigger release without publishing to npm
./scripts/trigger-release.sh

# Trigger release and publish to npm
./scripts/trigger-release.sh --publish
```

### Options

- `--publish`: Publish to npm after creating the release
- `--owner OWNER`: Specify the repository owner (default: zwidekalanga)
- `--repo REPO`: Specify the repository name (default: svelte-logviewer)

### Example

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Trigger release and publish to npm
./scripts/trigger-release.sh --publish
```

### How It Works

The script sends a POST request to the GitHub API to trigger a repository_dispatch event with the type "trigger-release". This event is configured to trigger the release workflow in .github/workflows/release.yml.

The release workflow will:

1. Create a release pull request using changesets
2. Optionally publish to npm if the `--publish` flag is provided
3. Build and deploy Storybook to GitHub Pages if a new version is published

### Security Considerations

- Never commit your GitHub token to the repository
- Use environment variables or a secure method to provide the token
- The token should have the minimum required permissions (repo scope)
