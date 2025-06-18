const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Pre-deploy validation script running...');

console.log('Checking Python version...');
try {
  const pythonVersion = execSync('python --version').toString();
  console.log(`Python version: ${pythonVersion}`);
} catch (err) {
  console.log('Failed to get Python version:', err.message);
}

console.log('Checking Node version...');
console.log(`Node version: ${process.version}`);

console.log('Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
console.log(`Package name: ${packageJson.name}`);
console.log(`Package version: ${packageJson.version}`);

// Check for potentially problematic dependencies
console.log('Checking for problematic dependencies...');
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

const potentialProblems = ['node-expat', 'node-gyp'];
potentialProblems.forEach(dep => {
  if (allDeps[dep]) {
    console.log(`⚠️ Warning: Potentially problematic dependency found: ${dep}`);
  }
});

// Check for direct dependencies
try {
  console.log('Checking installed dependencies...');
  const nodeModules = path.join(__dirname, '..', 'node_modules');
  
  if (fs.existsSync(nodeModules)) {
    const problematicPaths = [
      path.join(nodeModules, 'node-expat'),
      path.join(nodeModules, 'node-gyp')
    ];
    
    problematicPaths.forEach(depPath => {
      if (fs.existsSync(depPath)) {
        console.log(`⚠️ Found potentially problematic dependency at: ${depPath}`);
      }
    });
  } else {
    console.log('node_modules directory not found');
  }
} catch (err) {
  console.log('Error checking installed dependencies:', err.message);
}

console.log('Pre-deploy validation complete!');