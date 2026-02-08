#!/bin/bash
# filepath: universal-license-sdk/scripts/version.sh
# Update version across all SDK packages
# Syncs versions using Lerna's version command

set -e

echo "📌 Updating Universal License SDK versions..."
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
    echo -e "${RED}❌ Git working directory not clean. Commit changes first.${NC}"
    exit 1
fi

# Parse version type argument
VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
    echo "Usage: ./scripts/version.sh [major|minor|patch|prerelease]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/version.sh patch      # 1.0.0 → 1.0.1"
    echo "  ./scripts/version.sh minor      # 1.0.0 → 1.1.0"
    echo "  ./scripts/version.sh major      # 1.0.0 → 2.0.0"
    echo "  ./scripts/version.sh prerelease # 1.0.0 → 1.0.1-alpha.0"
    exit 1
fi

# Validate version type
case $VERSION_TYPE in
    major|minor|patch|prerelease)
        ;;
    *)
        echo -e "${RED}❌ Invalid version type: ${VERSION_TYPE}${NC}"
        echo "Must be one of: major, minor, patch, prerelease"
        exit 1
        ;;
esac

# Show current versions
echo -e "${BLUE}📋 Current package versions:${NC}"
lerna list --long
echo ""

# Update versions
echo -e "${BLUE}📌 Updating versions (${VERSION_TYPE})...${NC}"
lerna version $VERSION_TYPE --no-push --yes || {
    echo -e "${RED}❌ Version update failed!${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Versions updated successfully!${NC}"
echo ""
echo "📋 New versions:"
lerna list --long
echo ""
echo "🎯 Next steps:"
echo "  1. Review changes: git log --oneline -5"
echo "  2. Push changes: git push origin main --tags"
echo "  3. Publish packages: ./scripts/publish.sh"
echo ""