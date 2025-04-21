#!/usr/bin/env node

/**
 * Script to unpublish all versions of an npm package
 * Usage: node unpublish-all.js
 * 
 * This script will:
 * 1. Get all versions of the package
 * 2. Unpublish each version
 * 
 * Note: You must be logged in to npm with appropriate permissions
 * Run `npm login` before running this script
 */

const { execSync } = require('child_process');
const packageJson = require('./package.json');

const packageName = packageJson.name;

console.log(`Unpublishing all versions of ${packageName}...`);

try {
  // Get all versions of the package
  const versionsOutput = execSync(`npm view ${packageName} versions --json`, { encoding: 'utf8' });
  const versions = JSON.parse(versionsOutput);
  
  if (!Array.isArray(versions) || versions.length === 0) {
    console.log('No published versions found.');
    process.exit(0);
  }
  
  console.log(`Found ${versions.length} published versions: ${versions.join(', ')}`);
  
  // Confirm before proceeding
  console.log('\nWARNING: This will permanently unpublish all versions of the package.');
  console.log('This action cannot be undone and may affect users of your package.');
  console.log('To continue, run this script with the --force flag.');
  
  if (process.argv.includes('--force')) {
    // Unpublish each version
    versions.forEach(version => {
      try {
        console.log(`Unpublishing ${packageName}@${version}...`);
        execSync(`npm unpublish ${packageName}@${version} --force`, { stdio: 'inherit' });
        console.log(`Successfully unpublished ${packageName}@${version}`);
      } catch (error) {
        console.error(`Failed to unpublish ${packageName}@${version}:`, error.message);
      }
    });
    
    console.log('\nAll versions have been unpublished.');
  } else {
    console.log('\nOperation cancelled. Run with --force to proceed with unpublishing.');
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}