const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Pre-deploy validation script running...');

console.log('Checking Node.js environment...');
console.log(`Node version: ${process.version}`);
console.log(`NPM version: ${execSync('npm --version').toString().trim()}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);

console.log('Checking Python environment...');
try {
  const pythonVersion = execSync('python --version 2>&1').toString().trim();
  console.log(`Python version: ${pythonVersion}`);
} catch (err) {
  console.log('Failed to get Python version:', err.message);
  try {
    // Try python3 command as fallback
    const python3Version = execSync('python3 --version 2>&1').toString().trim();
    console.log(`Python3 version: ${python3Version}`);
  } catch (err2) {
    console.log('Failed to get Python3 version:', err2.message);
  }
}

console.log('Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
console.log(`Package name: ${packageJson.name}`);
console.log(`Package version: ${packageJson.version}`);
console.log(`Node engine requirement: ${packageJson.engines?.node || 'Not specified'}`);

// Check for potentially problematic dependencies
console.log('Checking for problematic dependencies...');
const allDeps = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

const potentialProblems = ['node-expat', 'node-gyp', 'xml2js', 'libxmljs', 'canvas', 'sharp'];
const foundProblems = [];

potentialProblems.forEach(dep => {
  if (allDeps[dep]) {
    foundProblems.push(dep);
    console.log(`⚠️ Warning: Potentially problematic dependency found: ${dep} (${allDeps[dep]})`);
  }
});

if (packageJson.overrides) {
  console.log('Overrides found in package.json:');
  for (const [pkg, version] of Object.entries(packageJson.overrides)) {
    console.log(`  - ${pkg}: ${version}`);
    if (foundProblems.includes(pkg)) {
      console.log(`    ✅ Problematic package ${pkg} has an override`);
    }
  }
}

// Check for installed dependencies
try {
  console.log('Checking installed dependencies...');
  const nodeModules = path.join(__dirname, '..', 'node_modules');
  
  if (fs.existsSync(nodeModules)) {
    potentialProblems.forEach(dep => {
      const depPath = path.join(nodeModules, dep);
      if (fs.existsSync(depPath)) {
        console.log(`⚠️ Found potentially problematic dependency at: ${depPath}`);
        
        try {
          // Check if it has a binding.gyp file (native module)
          const hasBindingGyp = fs.existsSync(path.join(depPath, 'binding.gyp'));
          if (hasBindingGyp) {
            console.log(`   ⚠️ ${dep} has a binding.gyp file (requires native compilation)`);
          }
        } catch (err) {
          console.log(`   Error checking binding.gyp for ${dep}:`, err.message);
        }
      }
    });
  } else {
    console.log('node_modules directory not found');
  }
} catch (err) {
  console.log('Error checking installed dependencies:', err.message);
}

console.log('Pre-deploy validation complete!');