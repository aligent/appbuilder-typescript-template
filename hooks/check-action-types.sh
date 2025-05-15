#!/usr/bin/env bash

echo -e "\n⏩ Checking action types before build... 🔍\n"

if npm run check-types:actions; then
  echo -e "\n⏩ Action type checking completed successfully! ✅\n"
  # Exiting with 0 allows the build to continue
  exit 0
else
  echo -e "\n⏩ Action type checking failed: ❌\n"
  # Exiting with non-zero will cause the build to be skipped/failed
  exit 1
fi