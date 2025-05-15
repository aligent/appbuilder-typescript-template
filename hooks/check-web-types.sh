#!/usr/bin/env bash

echo -e "\n💻 Checking web types before build... 🌐\n"

if npm run check-types:web; then
  echo -e "\n💻 Web type checking completed successfully! ✅\n"
  # Exiting with 0 allows the build to continue
  exit 0
else
  echo -e "\n💻 Web type checking failed: ❌\n"
  # Exiting with non-zero will cause the build to be skipped/failed
  exit 1
fi