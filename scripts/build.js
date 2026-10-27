import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Preparing source template for build...');
const sourceHtml = path.join(rootDir, 'index.source.html');
const rootHtml = path.join(rootDir, 'index.html');
const fourOhFour = path.join(rootDir, '404.html');
const distDir = path.join(rootDir, 'dist');
const distHtml = path.join(distDir, 'index.html');
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');

// 1. Ensure root index.html has /src/main.jsx for vite build
if (fs.existsSync(sourceHtml)) {
  fs.copyFileSync(sourceHtml, rootHtml);
}

// 2. Run Vite build
console.log('📦 Running Vite build...');
execSync('npx vite build', { stdio: 'inherit', cwd: rootDir });

// 3. Copy compiled dist/assets to root assets/
console.log('📂 Syncing compiled assets to repository root for direct GitHub Pages serving...');
if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  const files = fs.readdirSync(distAssets);
  for (const file of files) {
    fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
  }
}

// 4. Copy dist/index.html to root index.html and 404.html
if (fs.existsSync(distHtml)) {
  fs.copyFileSync(distHtml, rootHtml);
  fs.copyFileSync(distHtml, fourOhFour);
  console.log('✅ root index.html and 404.html updated with compiled production bundle!');
}

console.log('🎉 Build and direct-deployment bundle ready!');
