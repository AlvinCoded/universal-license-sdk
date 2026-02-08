import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function isSemverLike(version) {
  // Minimal sanity check; we just need something taggable.
  return typeof version === 'string' && /^\d+\.\d+\.\d+([-.+].*)?$/.test(version);
}

const corePackageJsonPath = path.join(repoRoot, 'packages', 'core', 'package.json');
const composerJsonPath = path.join(repoRoot, 'packages', 'php', 'composer.json');

const corePkg = readJson(corePackageJsonPath);
const nextVersion = corePkg?.version;

if (!isSemverLike(nextVersion)) {
  throw new Error(
    `Invalid or missing version in ${corePackageJsonPath}: ${String(nextVersion)}`
  );
}

const composer = readJson(composerJsonPath);

const { name, version: _oldVersion, ...rest } = composer;
const nextComposer = {
  name,
  version: nextVersion,
  ...rest,
};

writeJson(composerJsonPath, nextComposer);

console.log(`Synced PHP composer.json version -> ${nextVersion}`);
