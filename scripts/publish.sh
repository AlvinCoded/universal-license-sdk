#!/bin/bash
# Publish SDK packages to npm registry (recommended public platform)
# Uses Changesets for versioning + publishing.

set -e

echo "📦 Publishing Universal License SDK packages..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "lerna.json" ]; then
    echo -e "${RED}❌ Error: Must run from SDK root directory${NC}"
    exit 1
fi

# Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Git working directory not clean. Commit or stash changes first.${NC}"
    exit 1
fi

# Check if on main/master branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on main/master branch (current: ${BRANCH})${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check npm authentication
echo -e "${BLUE}🔐 Checking npm authentication...${NC}"
npm whoami > /dev/null 2>&1 || {
    echo -e "${RED}❌ Not logged in to npm. Run 'npm login' first.${NC}"
    exit 1
}
echo -e "${GREEN}✓ Authenticated as $(npm whoami)${NC}"
echo ""

# Guard: ensure no workspace protocol remains in publishable manifests.
echo -e "${BLUE}🧯 Verifying publish manifests (no workspace:* ranges)...${NC}"
if grep -R --line-number '\"workspace:' packages/core/package.json packages/js/package.json packages/react/package.json >/dev/null 2>&1; then
    echo -e "${RED}❌ Found workspace: protocol in a publishable package.json. Replace with real semver ranges before publishing.${NC}"
    grep -R --line-number '\"workspace:' packages/core/package.json packages/js/package.json packages/react/package.json || true
    exit 1
fi
echo -e "${GREEN}✓ Manifests look publishable${NC}"
echo ""

# Run full test suite
echo -e "${BLUE}🧪 Running full test suite...${NC}"
pnpm run test:coverage || {
    echo -e "${RED}❌ Tests failed. Fix tests before publishing.${NC}"
    exit 1
}
echo ""

# Run linting
echo -e "${BLUE}🔍 Running linters...${NC}"
pnpm run lint || {
    echo -e "${RED}❌ Linting failed. Fix errors before publishing.${NC}"
    exit 1
}
echo ""

# Build all packages
echo -e "${BLUE}🔨 Building all packages...${NC}"
pnpm run build || {
    echo -e "${RED}❌ Build failed. Fix errors before publishing.${NC}"
    exit 1
}
echo ""

# Show current versions
echo -e "${BLUE}📋 Current package versions:${NC}"
node -e "const fs=require('fs'); const pkgs=['packages/core/package.json','packages/js/package.json','packages/react/package.json']; for (const p of pkgs){const j=JSON.parse(fs.readFileSync(p,'utf8')); console.log(`${j.name}@${j.version}`)}"
echo ""

# Confirm publication
echo -e "${YELLOW}⚠️  This will publish packages to npm registry.${NC}"
read -p "Continue with publication? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Publication cancelled."
    exit 0
fi

# Publish using Changesets
echo ""
echo -e "${BLUE}📦 Publishing to npm...${NC}"
pnpm changeset publish || {
    echo -e "${RED}❌ Publication failed!${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Packages published successfully!${NC}"
echo ""
echo "🎉 Next steps:"
echo "  1. Push git tags: git push --tags"
echo "  2. Create GitHub release with changelog"
echo "  3. Update documentation if needed"
echo ""