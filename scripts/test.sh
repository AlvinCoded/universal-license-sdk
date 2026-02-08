#!/bin/bash
# filepath: universal-license-sdk/scripts/test.sh
# Run tests for all SDK packages
# Supports options for coverage, watch mode, and specific packages

set -e

echo "🧪 Running Universal License SDK tests..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
WATCH_MODE=false
COVERAGE=false
PACKAGE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --package=*)
            PACKAGE="${1#*=}"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Check if we're in the right directory
if [ ! -f "lerna.json" ]; then
    echo -e "${RED}❌ Error: Must run from SDK root directory${NC}"
    exit 1
fi

# Function to run tests for a package
run_package_tests() {
    local pkg=$1
    
    echo -e "${BLUE}🧪 Testing @unilic/${pkg}...${NC}"
    
    if [ ! -d "packages/${pkg}" ]; then
        echo -e "${YELLOW}⚠️  Package ${pkg} not found, skipping...${NC}"
        return
    fi
    
    cd "packages/${pkg}"
    
    # Build test command
    TEST_CMD="pnpm run test"
    
    if [ "$WATCH_MODE" = true ]; then
        TEST_CMD="${TEST_CMD}:watch"
    fi
    
    if [ "$COVERAGE" = true ]; then
        TEST_CMD="${TEST_CMD} -- --coverage"
    fi
    
    # Run tests
    eval $TEST_CMD || {
        echo -e "${RED}❌ Tests failed for ${pkg}${NC}"
        cd ../..
        exit 1
    }
    
    echo -e "${GREEN}✓ @unilic/${pkg} tests passed${NC}"
    echo ""
    
    cd ../..
}

# Run tests
if [ -n "$PACKAGE" ]; then
    # Test specific package
    run_package_tests "$PACKAGE"
else
    # Test all packages
    PACKAGES=("core" "js" "react")
    
    for pkg in "${PACKAGES[@]}"; do
        run_package_tests "$pkg"
    done
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"

# Show coverage summary if generated
if [ "$COVERAGE" = true ]; then
    echo ""
    echo "📊 Coverage reports generated:"
    for pkg in "${PACKAGES[@]}"; do
        if [ -d "packages/${pkg}/coverage" ]; then
            echo "  • packages/${pkg}/coverage/index.html"
        fi
    done
fi
echo ""