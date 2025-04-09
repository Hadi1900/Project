// fix-deployment.js - A script to fix deployment issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a proper build structure
console.log('Fixing deployment structure...');

// Create deployment directory if it doesn't exist
const deploymentDir = path.join(__dirname, 'deployment');
if (!fs.existsSync(deploymentDir)) {
  fs.mkdirSync(deploymentDir, { recursive: true });
}

// Create client/index directory structure
const clientIndexDir = path.join(__dirname, 'client', 'index');
if (!fs.existsSync(clientIndexDir)) {
  fs.mkdirSync(clientIndexDir, { recursive: true });
}

// Create a copy of index.html in the client/index directory
const sourceIndexHtml = path.join(__dirname, 'client', 'index.html');
const targetIndexHtml = path.join(clientIndexDir, 'index.html');

if (fs.existsSync(sourceIndexHtml)) {
  console.log('Copying index.html to client/index/index.html');
  fs.copyFileSync(sourceIndexHtml, targetIndexHtml);
}

console.log('Deployment structure fixed successfully!');
console.log('Now try deploying again using the Deploy button in Replit.');