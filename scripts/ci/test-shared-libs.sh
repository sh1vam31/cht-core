#!/bin/bash
# test-shared-libs.sh
# Custom script to test all shared-libs sequentially and print a clean summary
# of any failing workspaces at the end.

set -e

# Disable exit on error temporarily so we can catch failing tests across the loop
set +e

FAILED_LIBS=""
FAIL_COUNT=0
FINAL_EXIT_CODE=0
LIBS_DIR="shared-libs"
SEPARATOR="========================================================"

echo "--------------------------------------------------------"
echo "Starting Shared Libs Unit Tests..."
echo "--------------------------------------------------------"

for lib in "$LIBS_DIR"/*/; do
  # Skip if it's not a real directory
  [ -d "$lib" ] || continue

  # Ensure there is a package.json with a test script instead of relying on --if-present
  if [ ! -f "$lib/package.json" ] || ! grep -q '"test":' "$lib/package.json" 2>/dev/null; then
    continue
  fi

  # Remove trailing slash and extract the pure folder name
  lib_name=$(basename "$lib")
  
  echo ""
  echo ">>> Testing Workspace: $lib_name"
  echo "--------------------------------------------------------"
  
  # Run the unit test for this isolated workspace
  # Pipe through tee to capture output for identifying failing test names
  TEST_OUTPUT_FILE="/tmp/cht_test_output_${lib_name}.log"
  npm test --prefix "$lib" 2>&1 | tee "$TEST_OUTPUT_FILE"
  
  # Capture the exit status of the npm command (not tee)
  exit_status=${PIPESTATUS[0]}
  
  if [[ $exit_status -ne 0 ]]; then
    echo "Workspace '$lib_name' FAILED."
    
    # Store the first failing exit code we encounter to use at the end
    if [ "$FINAL_EXIT_CODE" -eq 0 ]; then
      FINAL_EXIT_CODE=$exit_status
    fi

    FAILED_LIBS="$FAILED_LIBS\n  - $LIBS_DIR/$lib_name"
    
    # Extract failing test names from mocha output (patterns like "  1) suite name test name:")
    FAILING_TESTS=$(grep -E "^ {2}[0-9]+\) " "$TEST_OUTPUT_FILE" | sed -E 's/^ *[0-9]+\) (.*)/\1/' || true)
    
    if [ -n "$FAILING_TESTS" ]; then
      while IFS= read -r test_name; do
        # Ignore empty lines
        if [ -n "$test_name" ]; then
          FAILED_LIBS="$FAILED_LIBS\n      ✖ $test_name"
        fi
      done <<< "$FAILING_TESTS"
    fi
    
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  
  rm -f "$TEST_OUTPUT_FILE"
done

echo ""
echo "$SEPARATOR"
echo "Shared Libs Test Suite Complete"
echo "$SEPARATOR"

if [[ $FAIL_COUNT -gt 0 ]]; then
  echo -e "ERROR: The following $FAIL_COUNT shared lib(s) failed their tests:\n" >&2
  echo -e "$FAILED_LIBS\n"
  echo "Please check the logs above for the specific workspace errors."
  echo "$SEPARATOR"
  exit $FINAL_EXIT_CODE
fi
