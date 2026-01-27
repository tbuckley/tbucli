const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = path.join(__dirname, '../gemini-extension.json');
const bumpType = (process.argv[2] || 'patch').toLowerCase();

const validTypes = ['major', 'minor', 'patch'];
if (!validTypes.includes(bumpType)) {
    console.error(`Invalid BUMP_TYPE "${bumpType}". Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
}

try {
  if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  
  let [major, minor, patch] = json.version.split('.').map(Number);

  if (bumpType === 'major') {
    major++;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor++;
    patch = 0;
  } else {
    patch++;
  }

  const newVersion = `${major}.${minor}.${patch}`;
  json.version = newVersion;
  
  console.log(`Bumping version to ${newVersion} (${bumpType})`);

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  
  // Git operations
  try {
      execSync(`git add "${filePath}"`);
      execSync(`git commit -m "chore: release v${newVersion}"`);
      execSync(`git tag v${newVersion}`);
      console.log(`Successfully tagged v${newVersion}`);
  } catch (gitError) {
      console.error('Error performing git operations:', gitError.message);
      // Don't exit 1 here, the file is already changed, which might be what they want if git fails
  }
  
} catch (error) {
  console.error('Error bumping version:', error);
  process.exit(1);
}
