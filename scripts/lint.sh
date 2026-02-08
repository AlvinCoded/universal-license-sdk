#!/bin/bash
# Run linting across all SDK packages
# Includes TypeScript, ESLint checks with auto-fix option

set -e

echo "🔍 Linting Universal License SDK packages..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
FIX=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

if [ ! -f "lerna.json" ]; then
    echo -e "${RED}❌ Error: Must run from SDK root directory${NC}"
    exit 1
fi

PACKAGES=("core" "js" "react")
FAILED=false

for pkg in "${PACKAGES[@]}"; do
    if [ ! -d "packages/${pkg}" ]; then
        echo -e "${YELLOW}⚠️  Package ${pkg} not found, skipping...${NC}"
        continue
    fi
    
    echo -e "${BLUE}🔍 Linting @universal-license/${pkg}...${NC}"
    cd "packages/${pkg}"
    
    # TypeScript check
    if [ -f "tsconfig.json" ]; then
        echo "  → Checking TypeScript types..."
        pnpm run typecheck || {
            echo -e "${RED}❌ TypeScript errors in ${pkg}${NC}"
            FAILED=true
        }
    fi
    
    # ESLint check
    if [ -f ".eslintrc.cjs" ] || [ -f ".eslintrc.js" ]; then
        echo "  → Running ESLint..."
        
        if [ "$FIX" = true ]; then
            pnpm run lint -- --fix || {
                echo -e "${YELLOW}⚠️  ESLint warnings in ${pkg}${NC}"
            }
        else
            pnpm run lint || {
                echo -e "${RED}❌ ESLint errors in ${pkg}${NC}"
                FAILED=true
            }
        fi
    fi
    
    if [ "$FAILED" = false ]; then
        echo -e "${GREEN}✓ @universal-license/${pkg} passed linting${NC}"
    fi
    
    echo ""
    cd ../..
done

if [ "$FAILED" = true ]; then
    echo -e "${RED}❌ Linting failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All packages passed linting!${NC}"
echo ""