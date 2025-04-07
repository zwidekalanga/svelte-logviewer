# Package Integration Tests

These tests verify that the `@zwidekalanga/svelte-logviewer` package is properly structured and can be imported by other Svelte/SvelteKit projects.

## What's being tested

1. **Package Exports** - Verifies the main package exports can be imported
2. **Component Rendering** - Tests that components render correctly when imported
3. **Import Formats** - Checks different ways of importing package contents
4. **Package Structure** - Validates that the build output follows best practices
5. **Package Config** - Ensures package.json is properly configured
6. **Installation Simulation** - Simulates installing the package in a real project

## Running tests

First, build the package:

```bash
yarn package
```

Then run the package integration tests:

```bash
yarn test:package
```

Or run directly with Vitest:

```bash
yarn vitest tests/package-integration
```

## Skip installation simulation

The installation simulation test is skipped by default as it requires filesystem operations and may not be suitable for CI environments. To run it locally:

1. Remove the `.skip` from the describe block in `simulate-install.test.ts`
2. Run the tests again:

```bash
yarn vitest tests/package-integration/simulate-install.test.ts
```

## Debugging issues

If tests fail, check:

1. **Build issues** - Ensure `yarn package` completes successfully
2. **Path issues** - Verify the directory structure matches expected paths
3. **Export configuration** - Check package.json "exports" field is correctly configured
4. **Type declarations** - Ensure TypeScript types are properly generated

The tests assume the package has been built to the `dist/` directory with the correct structure.
