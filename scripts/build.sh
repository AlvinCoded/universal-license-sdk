#!/bin/bash
# Build all SDK packages in the correct order
# This ensures dependencies are built before dependent packages

set -e  # Exit on error

echo "🔨 Building Universal License SDK packages..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "lerna.json" ]; then
    echo -e "${RED}❌ Error: Must run from SDK root directory${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${BLUE}📦 Cleaning previous builds...${NC}"
pnpm run clean || echo "Clean failed, continuing..."
echo ""

# Build order: core -> js -> react (dependencies first)
PACKAGES=("core" "js" "react")

for package in "${PACKAGES[@]}"; do
    echo -e "${BLUE}🔨 Building @universal-license/${package}...${NC}"
    
    if [ -d "packages/${package}" ]; then
        cd "packages/${package}"
        
        # Run typecheck first
        if [ -f "tsconfig.json" ]; then
            echo "  → Type checking..."
            pnpm run typecheck || {
                echo -e "${RED}❌ Type check failed for ${package}${NC}"
                exit 1
            }
        fi
        
        # Run build
        echo "  → Building..."
        pnpm run build || {
            echo -e "${RED}❌ Build failed for ${package}${NC}"
            exit 1
        }
        
        echo -e "${GREEN}✓ @universal-license/${package} built successfully${NC}"
        echo ""
        
        cd ../..
    else
        echo -e "${YELLOW}⚠️  Package ${package} not found, skipping...${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ All packages built successfully!${NC}"
echo ""
echo "📦 Built packages:"
echo "  • @universal-license/core      → packages/core/dist/"
echo "  • @universal-license/client    → packages/js/dist/"
echo "  • @universal-license/react     → packages/react/dist/"
echo ""