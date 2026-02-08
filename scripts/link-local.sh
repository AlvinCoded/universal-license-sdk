#!/bin/bash
# Link SDK packages for local development
# Useful when testing SDK integration in your main project

set -e

echo "🔗 Linking Universal License SDK packages for local development..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "lerna.json" ]; then
    echo "❌ Error: Must run from SDK root directory"
    exit 1
fi

# Build packages first
echo -e "${BLUE}🔨 Building packages...${NC}"
./scripts/build.sh
echo ""

# Link packages
PACKAGES=("core" "js" "react")

echo -e "${BLUE}🔗 Creating symlinks...${NC}"
for pkg in "${PACKAGES[@]}"; do
    if [ -d "packages/${pkg}" ]; then
        cd "packages/${pkg}"
        
        echo "  → Linking @universal-license/${pkg}"
        pnpm link --global || npm link
        
        cd ../..
    fi
done

echo ""
echo -e "${GREEN}✅ Packages linked successfully!${NC}"
echo ""
echo "📋 Usage in your project:"
echo ""
echo "  cd /path/to/your/project"
echo "  pnpm link @universal-license/client"
echo "  pnpm link @universal-license/react"
echo ""
echo "💡 To unlink:"
echo "  pnpm unlink @universal-license/client"
echo "  pnpm unlink @universal-license/react"
echo ""