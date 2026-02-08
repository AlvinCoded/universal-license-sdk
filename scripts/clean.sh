#!/bin/bash
# Clean build artifacts and dependencies
# Useful for fresh rebuilds

set -e

echo "🧹 Cleaning Universal License SDK..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ ! -f "lerna.json" ]; then
    echo "❌ Error: Must run from SDK root directory"
    exit 1
fi

# Parse arguments
DEEP_CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --deep)
            DEEP_CLEAN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Clean build artifacts
echo -e "${BLUE}🗑️  Removing build artifacts...${NC}"
find packages -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find packages -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true

# Clean coverage reports
echo -e "${BLUE}🗑️  Removing coverage reports...${NC}"
find packages -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
find packages -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true

if [ "$DEEP_CLEAN" = true ]; then
    echo -e "${BLUE}🗑️  Deep clean: Removing node_modules...${NC}"
    
    # Remove root node_modules
    rm -rf node_modules
    
    # Remove package node_modules
    find packages -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove lock files
    rm -f pnpm-lock.yaml
    find packages -name "pnpm-lock.yaml" -delete 2>/dev/null || true
    
    echo ""
    echo -e "${GREEN}✅ Deep clean complete!${NC}"
    echo "Run 'pnpm install' to reinstall dependencies."
else
    echo ""
    echo -e "${GREEN}✅ Clean complete!${NC}"
    echo "Run './scripts/build.sh' to rebuild."
fi

echo ""