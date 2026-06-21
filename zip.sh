#!/bin/bash

# Get the name of the current directory to use as the zip filename
PROJECT_NAME=$(basename "$PWD")
ZIP_FILE="${PROJECT_NAME}.zip"

echo "=========================================================="
echo "Creating zip archive: $ZIP_FILE"
echo "=========================================================="

# Remove existing zip if it exists to avoid adding to it
if [ -f "$ZIP_FILE" ]; then
  echo "Removing existing $ZIP_FILE..."
  rm "$ZIP_FILE"
fi

# Run zip command with exclusions
# Excludes:
# - node_modules
# - .git folders
# - .next build folders
# - dist and build folders
# - TypeScript build cache (.tsbuildinfo)
# - macOS metadata (.DS_Store)
# - any existing zip files
zip -r "$ZIP_FILE" . \
  -x "node_modules/*" "*/node_modules/*" \
  -x ".git/*" "*/.git/*" \
  -x ".next/*" "*/.next/*" \
  -x "dist/*" "*/dist/*" \
  -x "build/*" "*/build/*" \
  -x "out/*" "*/out/*" \
  -x "coverage/*" "*/coverage/*" \
  -x ".vercel/*" "*/.vercel/*" \
  -x "*.tsbuildinfo" "*/tsconfig.tsbuildinfo" \
  -x ".DS_Store" "*/.DS_Store" \
  -x "*.env" "*/.env" "*.env.local" "*/.env.local" "*.env.development" "*/.env.development" "*.env.production" "*/.env.production" "*.env.test" "*/.env.test" "*.env.staging" "*/.env.staging" \
  -x "*.pem" "*/*.pem" \
  -x "*.log" "*/*.log" \
  -x "*/generated/prisma/*" \
  -x "*.zip"

# Check if the zip command was successful
if [ $? -eq 0 ]; then
  echo "=========================================================="
  echo "🎉 Success! Created $ZIP_FILE"
  echo "Location: $(pwd)/$ZIP_FILE"
  echo "Size: $(du -sh "$ZIP_FILE" | cut -f1)"
  echo "=========================================================="
else
  echo "❌ Error: Failed to create the zip archive."
fi
