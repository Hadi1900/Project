#!/bin/bash
# Custom deployment script to fix the build issues

echo "Starting custom deployment process..."

# Build the frontend
cd client
echo "Building frontend from client directory..."
../node_modules/.bin/vite build --outDir=../dist/public
cd ..

# Build the backend
echo "Building backend..."
./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"