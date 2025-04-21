# CI/CD Pipeline

This document describes the CI/CD pipeline for the Svelte LogViewer project.

## Workflow Diagram

```mermaid
graph TD
    %% Main workflow triggers
    PR[Pull Request] --> CI
    Push[Push to Branch] --> CI
    Manual[Manual Trigger] --> CI
    TagPush[Push Tag] --> CI

    %% Main CI/CD Pipeline
    subgraph "CI/CD Pipeline"
        CI[CI/CD Workflow] --> Setup
        Setup[Setup Environment] --> |Cache Dependencies| Lint
        Setup --> |Parallel| Build

        Lint[Lint & Type Check] --> Tests
        Build[Build Package] --> |Upload Artifacts| Tests

        subgraph "Test Suite"
            Tests[Tests] --> |Parallel| UnitTests
            Tests --> |Parallel| E2ETests

            UnitTests[Unit Tests] --> |Sharded 1/4| UT1[Shard 1]
            UnitTests --> |Sharded 2/4| UT2[Shard 2]
            UnitTests --> |Sharded 3/4| UT3[Shard 3]
            UnitTests --> |Sharded 4/4| UT4[Shard 4]

            E2ETests[E2E Tests] --> |Sharded 1/2| ET1[Shard 1]
            E2ETests --> |Sharded 2/2| ET2[Shard 2]
        end

        Tests --> |On Success| Docs[Build Documentation]
    end

    %% Branching Strategy
    subgraph "Luijten Branching Strategy"
        Main[main branch] --> |Next major version| Main
        Main --> |Create| VersionBranch[Version Branch (*.x)]

        VersionBranch --> |Non-breaking changes| FeatureBranch1[Feature Branch]
        FeatureBranch1 --> |PR| VersionBranch

        Main --> |Breaking changes| FeatureBranch2[Feature Branch]
        FeatureBranch2 --> |PR| Main

        VersionBranch --> |Merge non-breaking| Main
        VersionBranch --> |Tag| VersionTag[Version Tag (v*)]
    end

    %% Conditional publishing paths
    Tests --> |If Push to Version Branch| Version

    subgraph "Release Process"
        Version[Check Version] --> |Version in PR| UseVersion[Use PR Version]
        Version --> |Auto Version| BumpVersion[Bump Version]

        UseVersion --> Publish
        BumpVersion --> Publish

        Publish[Publish to npm] --> DeployDocs[Deploy Documentation]
        Publish --> |Non-breaking| MergeToMain[Merge to main]
    end

    %% Changesets workflow
    subgraph "Changesets Automation"
        PushVersion[Push to Version Branch] --> Changesets
        Changesets[Changesets Workflow] --> CheckChanges[Check for Changesets]
        CheckChanges --> |Changes Found| CreatePR[Create Release PR]
        CheckChanges --> |On Release Branch| PublishRelease[Publish Release]
        PublishRelease --> UpdateChangelog[Update Changelog]
        PublishRelease --> |Create Tag| CreateTag[Create Version Tag]
    end

    %% Connections between workflows
    DeployDocs --> |Update| Docs

    %% Caching strategy
    classDef cache fill:#f9f,stroke:#333,stroke-width:2px
    class Setup cache

    %% Parallel processes
    classDef parallel fill:#bbf,stroke:#333,stroke-width:1px
    class UnitTests,E2ETests parallel

    %% Conditional steps
    classDef conditional fill:#bfb,stroke:#333,stroke-width:1px
    class Version,CheckChanges conditional

    %% Branching strategy
    classDef branch fill:#fbb,stroke:#333,stroke-width:1px
    class Main,VersionBranch,FeatureBranch1,FeatureBranch2 branch
```

## Workflow Files

- `.github/workflows/ci.yml`: Main CI/CD pipeline
- `.github/workflows/changesets.yml`: Automated versioning and publishing
- `.github/workflows/setup.yml`: Reusable setup workflow

## Key Features

1. **Reusable Setup**: Common setup steps are extracted into a reusable workflow
2. **Enhanced Caching**: Dependencies and build artifacts are cached for faster builds
3. **Parallel Testing**: Tests are run in parallel with sharding for faster feedback
4. **Automated Versioning**: Changesets is used for automated semantic versioning
5. **Documentation Automation**: Storybook is built and deployed automatically

## How It Works

1. When a pull request is opened or updated, the CI/CD pipeline runs:

   - Linting and type checking
   - Building the package
   - Running unit tests and E2E tests in parallel

2. When changes are pushed to version branches (e.g., `0.x`, `1.x`):
   - The CI/CD pipeline runs as above
   - The Changesets workflow checks for changesets in the `.changeset` directory
   - If changesets are found, a release PR is created or the changes are published
   - Documentation is built and deployed
   - Non-breaking changes are automatically merged back to `main`

3. When changes are pushed to the `main` branch:
   - The CI/CD pipeline runs as above
   - The `main` branch is reserved for the next major version development
   - Breaking changes should be targeted to the `main` branch

## Branching Strategy

We follow the Luijten branching strategy for library development:

1. **Branch Structure**:
   - `main` branch is always for the next major version development
   - Each major version has its own branch (e.g., `0.x`, `1.x`, `2.x`)
   - The current stable version branch is the default branch

2. **Version Flow**:
   - Non-breaking changes: PR → current version branch → merge to `main`
   - Breaking changes: PR → `main` only
   - Bug fixes: PR → latest version → cherry-pick to previous versions

3. **Release Process**:
   - New major version: Create new version branch from `main`, tag, make default
   - New minor version: Tag from current version branch
   - New patch version: Tag from affected version branches

## Manual Triggers

Both workflows can be triggered manually:

- The CI/CD pipeline can be triggered with `workflow_dispatch`
- The Changesets workflow can be triggered with `workflow_dispatch`
