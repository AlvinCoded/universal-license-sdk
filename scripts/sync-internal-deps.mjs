import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packagesDir = path.join(repoRoot, 'packages');

const DEP_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function listPackageJsonPaths() {
  if (!fs.existsSync(packagesDir)) return [];
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(packagesDir, d.name, 'package.json'))
    .filter((p) => fs.existsSync(p));
}

function resolveWorkspaceRange(workspaceValue, targetVersion) {
  // pnpm workspace protocol values: workspace:^, workspace:~, workspace:*
  // npm does not accept these in published manifests.
  if (workspaceValue === 'workspace:^') return `^${targetVersion}`;
  if (workspaceValue === 'workspace:~') return `~${targetVersion}`;
  if (workspaceValue === 'workspace:*') return `^${targetVersion}`;

  // Some tools may emit workspace:<semver>
  if (workspaceValue.startsWith('workspace:')) {
    const raw = workspaceValue.slice('workspace:'.length);
    return raw || `^${targetVersion}`;
  }

  return workspaceValue;
}

const packageJsonPaths = listPackageJsonPaths();

// Build name -> version map
const versionByName = new Map();
for (const p of packageJsonPaths) {
  const pkg = readJson(p);
  if (pkg?.name && pkg?.version) {
    versionByName.set(pkg.name, pkg.version);
  }
}

let changedCount = 0;

for (const p of packageJsonPaths) {
  const pkg = readJson(p);
  let changed = false;

  for (const section of DEP_SECTIONS) {
    const deps = pkg[section];
    if (!deps || typeof deps !== 'object') continue;

    for (const [depName, depRange] of Object.entries(deps)) {
      if (typeof depRange !== 'string') continue;
      if (!depRange.startsWith('workspace:')) continue;

      const targetVersion = versionByName.get(depName);
      if (!targetVersion) continue; // only rewrite internal deps we can resolve

      const next = resolveWorkspaceRange(depRange, targetVersion);
      if (next !== depRange) {
        deps[depName] = next;
        changed = true;
      }
    }
  }

  if (changed) {
    writeJson(p, pkg);
    changedCount++;
  }
}

console.log(`Synced internal workspace dependency ranges in ${changedCount} package(s).`);
