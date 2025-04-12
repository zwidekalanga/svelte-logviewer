# Changesets

This project uses [changesets](https://github.com/changesets/changesets) to manage versioning and publishing.

## Adding a changeset

When you make a change that needs to be published, run:

```bash
yarn changeset
```

This will prompt you to:

1. Select which packages you want to include in the changeset
2. Choose the type of version bump (patch, minor, major)
3. Write a summary of the changes

A new markdown file will be created in the `.changeset` directory. Commit this file along with your changes.

## How it works

When changes are pushed to the main branch:

1. The Changesets GitHub Action will detect any changesets
2. It will either:
   - Create a PR to update versions and changelogs
   - Publish the changes to npm if on a release branch

## Version bumps

- **patch**: Bug fixes and minor changes that don't affect the API
- **minor**: New features that don't break backward compatibility
- **major**: Breaking changes

## Example changeset

```markdown
---
'@zwidekalanga/svelte-logviewer': minor
---

Added new feature X that allows users to do Y
```
