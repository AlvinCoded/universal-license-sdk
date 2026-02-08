#!/bin/bash
# Start development environment with watch mode
# Builds packages in watch mode for rapid development

set -e

echo "🚀 Starting Universal License SDK development environment..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ ! -f "lerna.json" ]; then
    echo -e "${RED}❌ Error: Must run from SDK root directory${NC}"
    exit 1
fi

# Parse arguments
PACKAGE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --package=*)
            PACKAGE="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to start dev mode for a package
start_dev() {
    local pkg=$1
    
    if [ ! -d "packages/${pkg}" ]; then
        echo "Package ${pkg} not found!"
        exit 1
    fi
    
    echo -e "${BLUE}🔨 Starting @universal-license/${pkg} in watch mode...${NC}"
    echo ""
    
    cd "packages/${pkg}"
    pnpm run dev
}

if [ -n "$PACKAGE" ]; then
    # Dev mode for specific package
    start_dev "$PACKAGE"
else
    # Dev mode for all packages (using concurrently if available)
    echo -e "${BLUE}🔨 Starting all packages in watch mode...${NC}"
    echo ""
    
    # Use lerna run with --parallel flag
    lerna run dev --parallel || {
        echo "Install concurrently globally: npm install -g concurrently"
        echo "Or run specific package: ./scripts/dev.sh --package=js"
        exit 1
    }
fi