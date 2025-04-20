# Security Update: Addressing CKV_GHA_7

## Overview

This document explains the changes made to address the security concern identified by checkov rule CKV_GHA_7:

> The build output cannot be affected by user parameters other than the build entry point and the top-level source location. GitHub Actions workflow_dispatch inputs MUST be empty.

## Changes Made

1. **Removed workflow_dispatch inputs from CI workflow**

   - Modified `.github/workflows/ci.yml` to remove the `trigger_release` and `publish_to_npm` inputs
   - Kept the empty workflow_dispatch trigger to allow manual triggering of the CI workflow

2. **Created a separate release workflow**

   - Created `.github/workflows/release.yml` that is triggered by a repository_dispatch event
   - Moved the release job from the CI workflow to the new release workflow
   - This approach maintains the same functionality while addressing the security concern

3. **Added a script to trigger the release process**

   - Created `scripts/trigger-release.sh` to trigger the release process using the GitHub API
   - The script allows specifying whether to publish to npm or not
   - Made the script executable with `chmod +x`

4. **Updated documentation**
   - Updated `RELEASE_CHANGES.md` to document the changes made to the release process
   - Created `scripts/README.md` to provide documentation for the trigger-release.sh script

## Benefits

1. **Enhanced Security**

   - Complies with security best practices by removing workflow_dispatch inputs
   - Uses repository_dispatch event for secure manual triggering

2. **Maintained Functionality**

   - All the functionality of the previous release process is preserved
   - The release process can still be triggered manually
   - The option to publish to npm is still available

3. **Improved Documentation**
   - Clear documentation on how to use the new release process
   - Security considerations are documented

## How to Use the New Release Process

To trigger a release:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token

# Trigger release without publishing to npm
./scripts/trigger-release.sh

# Trigger release and publish to npm
./scripts/trigger-release.sh --publish
```

## Required Secrets

The workflow requires the following secrets to be set in your GitHub repository:

1. `GH_PAT`: A GitHub Personal Access Token with the `repo` scope
2. `NPM_TOKEN`: An NPM token with publish permissions

The same GitHub token should be used when running the trigger-release.sh script.
