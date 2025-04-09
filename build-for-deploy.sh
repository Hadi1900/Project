#!/bin/bash
# Custom build script for deployment

# Create symbolic link to help with build process
echo "Setting up symbolic links for build..."
mkdir -p client/index
ln -s ../index.html client/index/index.html

# Clean any previous build
echo "Cleaning previous builds..."
rm -rf dist

# Run the build commands
echo "Building frontend..."
npx vite build

# Clean up symbolic links after build
echo "Cleaning up..."
rm -rf client/index

echo "Build completed successfully! You can now use the Deploy button in Replit."