// merge-coverage.js
import fs from 'fs';
import libCoverage from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import path from 'path';

// Directory setup
const COVERAGE_DIR = './coverage';
const UNIT_COVERAGE_JSON = path.join(COVERAGE_DIR, 'coverage-final.json');
const E2E_COVERAGE_DIR = path.join(COVERAGE_DIR, 'e2e-coverage');
const E2E_COVERAGE_JSON = path.join(E2E_COVERAGE_DIR, 'coverage-final.json'); // Monocart outputs coverage-final.json with istanbul format
const OUTPUT_DIR = path.join(COVERAGE_DIR, 'combined');

// Create a coverage map
const coverageMap = libCoverage.createCoverageMap({});

/**
 * Normalize file paths by removing workspace prefix from absolute paths
 * @param {object} coverage - Coverage data object
 * @returns {object} - Normalized coverage data
 */
function normalizePaths(coverage) {
	const normalizedCoverage = {};
	// Common workspace paths to check for and remove
	const workspacePaths = [
		'/home/runner/work/svelte-logviewer/svelte-logviewer/',
		process.cwd() + '/'
	];

	Object.keys(coverage).forEach((key) => {
		let normalizedKey = key;

		// Try to normalize the key by removing workspace prefix
		for (const workspacePath of workspacePaths) {
			if (key.startsWith(workspacePath)) {
				normalizedKey = key.substring(workspacePath.length);
				break;
			}
		}

		// Copy the coverage data
		normalizedCoverage[normalizedKey] = { ...coverage[key] };

		// Also normalize the path property if it exists
		if (normalizedCoverage[normalizedKey].path) {
			for (const workspacePath of workspacePaths) {
				if (normalizedCoverage[normalizedKey].path.startsWith(workspacePath)) {
					normalizedCoverage[normalizedKey].path = normalizedCoverage[normalizedKey].path.substring(
						workspacePath.length
					);
					break;
				}
			}
		}
	});

	return normalizedCoverage;
}

/**
 * Load coverage data from a file
 * @param {string} file - Path to the coverage file
 * @param {string} type - Type of coverage (unit or e2e)
 */
function loadCoverage(file, type) {
	try {
		if (fs.existsSync(file)) {
			console.log(`Loading ${type} coverage from ${file}`);
			const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));

			// Normalize paths in the coverage data before merging
			const normalizedCoverage = normalizePaths(coverage);
			console.log(
				`Normalized ${Object.keys(normalizedCoverage).length} file paths from ${type} coverage`
			);

			coverageMap.merge(normalizedCoverage);
		} else {
			console.warn(`Warning: ${type} coverage file not found at ${file}`);
		}
	} catch (error) {
		console.error(`Error loading ${type} coverage from ${file}:`, error.message);
	}
}

// Load unit test coverage
loadCoverage(UNIT_COVERAGE_JSON, 'unit');

// Load E2E test coverage
loadCoverage(E2E_COVERAGE_JSON, 'e2e');

// If we have coverage data, generate reports
if (Object.keys(coverageMap.data).length > 0) {
	try {
		// Create output directory if it doesn't exist
		if (!fs.existsSync(OUTPUT_DIR)) {
			fs.mkdirSync(OUTPUT_DIR, { recursive: true });
		}

		// Set up the report context
		const context = libReport.createContext({
			dir: OUTPUT_DIR,
			coverageMap: coverageMap
		});

		// Generate reports in multiple formats
		const reportTypes = [
			'lcov', // Generates lcov.info file
			'html', // Generates HTML report
			'text', // Console output
			'json' // Generates coverage-final.json
		];

		reportTypes.forEach((type) => {
			reports.create(type, {}).execute(context);
		});

		// Copy lcov.info to the root coverage directory for convenience
		const lcovSource = path.join(OUTPUT_DIR, 'lcov.info');
		const lcovDest = path.join(COVERAGE_DIR, 'lcov.info');
		fs.copyFileSync(lcovSource, lcovDest);

		console.log('Combined coverage reports generated:');
		console.log(` - LCOV: ${lcovDest}`);
		console.log(` - HTML: ${path.join(OUTPUT_DIR, 'index.html')}`);
		console.log(` - JSON: ${path.join(OUTPUT_DIR, 'coverage-final.json')}`);
	} catch (error) {
		console.error('Error generating combined coverage report:', error);
		process.exit(1);
	}
} else {
	console.error('No coverage data found. Make sure to run tests with coverage enabled.');
	process.exit(1);
}
