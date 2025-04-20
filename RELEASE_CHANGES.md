# Release Process Changes

## Overview

This document explains the changes made to the release process for the Svelte LogViewer package.

## Latest Changes (Security Update)

1. **Separated Release Process from CI Pipeline**

   - Removed workflow_dispatch inputs from CI workflow to address security concern (CKV_GHA_7)
   - Created a separate release workflow file that is triggered by repository_dispatch event
   - Added a script to trigger the release process using the GitHub API

2. **How to Use the Updated Release Process**

   - Use the provided script to trigger the release process:

     ```bash
     # Set your GitHub token
     export GITHUB_TOKEN=your_github_token

     # Trigger release without publishing to npm
     ./scripts/trigger-release.sh

     # Trigger release and publish to npm
     ./scripts/trigger-release.sh --publish
     ```

## Previous Changes

1. **Removed Separate Workflows**

   - Removed `manual-release.yml` file
   - Removed `changesets.yml` file

2. **Integrated Release Process into CI Pipeline**
   - Added a `release` job directly to the CI workflow
   - The release job is only triggered manually when the `trigger_release` input is set to true
   - The release job depends on the `code_coverage` job, ensuring it only runs after the CI pipeline has completed successfully

## Benefits of the Current Approach

1. **Enhanced Security**

   - Complies with security best practices by removing workflow_dispatch inputs
   - Uses repository_dispatch event for secure manual triggering

2. **Simplified Workflow**

   - Clear separation between CI and release processes
   - Easier to maintain and understand

3. **Improved Reliability**

   - Release process can be triggered independently
   - No dependency on workflow_dispatch inputs

4. **Same Functionality**
   - All the functionality of the previous release process is preserved
   - Still uses changesets for versioning and changelog generation
   - Still supports publishing to npm and deploying to GitHub Pages

## Required Secrets

The workflow requires the following secrets to be set in your GitHub repository:

1. `GH_PAT`: A GitHub Personal Access Token with the `repo` scope
2. `NPM_TOKEN`: An NPM token with publish permissions

The same GitHub token should be used when running the trigger-release.sh script.
