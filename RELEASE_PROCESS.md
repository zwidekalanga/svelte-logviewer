# Release Process Documentation

## Overview

This document explains the current release process for the Svelte LogViewer package. The release process is designed to be triggered manually only, not automatically when pushing to the main branch.

## Release Workflows

The release process involves the following GitHub workflow files:

1. `.github/workflows/changesets.yml` - The main release workflow
2. `.github/workflows/manual-release.yml` - A workflow to manually trigger the changesets workflow
3. `.github/workflows/ci.yml` - The CI pipeline, which can optionally trigger the changesets workflow

## How to Trigger a Release

There are three ways to trigger the release process:

### Option 1: Directly from the GitHub Actions UI

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Changesets" workflow
3. Click "Run workflow"
4. Choose whether to publish to npm or just create a release PR
5. Click "Run workflow"

### Option 2: Using the Manual Release Workflow

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Manual Release" workflow
3. Click "Run workflow"
4. Choose whether to publish to npm or just create a release PR
5. Click "Run workflow"

This will trigger the Changesets workflow with the specified parameters.

### Option 3: As part of the CI pipeline

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

## Changesets

The release process uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. To create a new changeset:

1. Run `yarn changeset` to create a new changeset
2. Follow the prompts to select the packages to be updated and the type of change (major, minor, patch)
3. Write a description of the changes
4. Commit the changeset file to the repository

When the release process is triggered, it will use the changesets to determine the new version number and update the changelog.

## Important Notes

- The release process is **not** automatically triggered when pushing to the main branch
- It must be manually triggered using one of the methods described above
- The Changesets workflow will verify that the CI pipeline has completed successfully before proceeding
- The release process uses a Personal Access Token (GH_PAT) instead of the default GITHUB_TOKEN to avoid permission issues
