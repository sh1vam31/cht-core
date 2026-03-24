#!/bin/bash
# test-shared-libs.sh
# Custom script to test all shared-libs sequentially and print a clean summary
# of any failing workspaces at the end.

set -e

# Disable exit on error temporarily so we can catch failing tests across the loop
set +e

FAILED_LIBS=""
FAIL_COUNT=0
LIBS_DIR="shared-libs"

echo "--------------------------------------------------------"
echo "Starting Shared Libs Unit Tests..."
echo "--------------------------------------------------------"

for lib in "$LIBS_DIR"/*/; do
  # Remove trailing slash and extract the pure folder name
  lib_name=$(basename "$lib")
  
  echo ""
  echo ">>> Testing Workspace: $lib_name"
  echo "--------------------------------------------------------"
  
  # Run the unit test for this isolated workspace
  npm test --prefix "$lib" --if-present
  
  exit_status=$?
  if [ $exit_status -ne 0 ]; then
    echo "Workspace '$lib_name' FAILED."
    FAILED_LIBS="$FAILED_LIBS  - $LIBS_DIR/$lib_name\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "[PASS] Workspace '$lib_name' PASSED (or no tests found)."
  fi
done

echo ""
echo "========================================================"
echo "Shared Libs Test Suite Complete"
echo "========================================================"

if [ $FAIL_COUNT -gt 0 ]; then
  echo -e "ERROR: The following $FAIL_COUNT shared lib(s) failed their tests:\n"
  echo -e "$FAILED_LIBS"
  echo "Please check the logs above for the specific workspace errors."
  echo "========================================================"
  exit 1
else
  echo -e "SUCCESS: All shared libs passed successfully!"
  echo "========================================================"
  exit 0
fi
