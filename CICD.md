# CI/CD Pipeline

This document describes the CI/CD pipeline for the Svelte LogViewer project.

## Workflow Diagram

```mermaid
graph TD
    %% Main workflow triggers
    PR[Pull Request] --> CI
    Push[Push to Branch] --> CI
    Manual[Manual Trigger] --> CI

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

    %% Conditional publishing paths
    Tests --> |If Push to Main| Version

    subgraph "Release Process"
        Version[Check Version] --> |Version in PR| UseVersion[Use PR Version]
        Version --> |Auto Version| BumpVersion[Bump Version]

        UseVersion --> Publish
        BumpVersion --> Publish

        Publish[Publish to npm] --> DeployDocs[Deploy Documentation]
    end

    %% Changesets workflow
    subgraph "Changesets Automation"
        PushMain[Push to Main] --> Changesets
        Changesets[Changesets Workflow] --> CheckChanges[Check for Changesets]
        CheckChanges --> |Changes Found| CreatePR[Create Release PR]
        CheckChanges --> |On Release Branch| PublishRelease[Publish Release]
        PublishRelease --> UpdateChangelog[Update Changelog]
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

2. When changes are pushed to the main branch:
   - The CI/CD pipeline runs as above
   - The Changesets workflow checks for changesets
   - If changesets are found, a release PR is created or the changes are published
   - Documentation is built and deployed

## Manual Triggers

Both workflows can be triggered manually:

- The CI/CD pipeline can be triggered with `workflow_dispatch`
- The Changesets workflow can be triggered by pushing to the main branch
