# Resetting NPM Package Version

This document explains how to reset the npm package version to 0.0.1 and unpublish all previous versions.

## Prerequisites

- You must have npm installed and be logged in with appropriate permissions
- You must have access to unpublish the package

## Steps to Reset the Package

1. **Login to npm** (if not already logged in)

   ```bash
   npm login
   ```

2. **Unpublish all existing versions**

   We've provided a script to help with this process:

   ```bash
   # First run without --force to see what versions will be unpublished
   node unpublish-all.js

   # Then run with --force to actually unpublish
   node unpublish-all.js --force
   ```

3. **Verify all versions are unpublished**

   ```bash
   npm view @zwidekalanga/svelte-logviewer versions
   ```

   This should return an error if all versions have been successfully unpublished.

4. **Update package.json**

   The package.json file has already been updated to version 0.0.1.

5. **Create a changeset**

   A changeset has been created to document this reset:

   ```
   .changeset/reset-version.md
   ```

6. **Publish the new version**

   After the changes are committed and pushed, the CI/CD pipeline will publish the new version 0.0.1 to npm.

## Important Notes

- Unpublishing packages can affect users who depend on your package
- npm has restrictions on unpublishing packages that have been published for more than 72 hours
- Once you unpublish a version, you cannot publish the same version again (npm will prevent this)
- This process is intended for packages that haven't been widely distributed yet

## Troubleshooting

If you encounter issues with unpublishing:

- Check that you have the correct permissions for the package
- For packages published more than 72 hours ago, you may need to contact npm support
- If the package is a scoped package (@username/package-name), ensure you're logged in as the correct user
