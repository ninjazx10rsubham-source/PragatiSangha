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

// 2. Run Vite build (compatible with both Windows and Linux/CI)
console.log('📦 Running Vite build...');
const viteCmd = process.platform === 'win32' ? 'npx.cmd vite build' : 'npx vite build';
execSync(viteCmd, { stdio: 'inherit', cwd: rootDir });

// 3. Copy compiled dist/assets to root assets/
console.log('📂 Syncing compiled assets to repository root for direct GitHub Pages serving...');
if (fs.existsSync(distAssets)) {
  if (!fs.existsSync(rootAssets)) {
    fs.mkdirSync(rootAssets, { recursive: true });
  }
  // Clear old assets in rootAssets
  const existingRootFiles = fs.readdirSync(rootAssets);
  for (const f of existingRootFiles) {
    try { fs.unlinkSync(path.join(rootAssets, f)); } catch (e) {}
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

// 5. Ensure images in dist
for (const imgName of ['maa_kali_full_bg.jpg', 'maa_shyama_dorson.jpg', 'maa_shyama_bg.jpg', 'maa_shyama.jpg']) {
  const rootImg = path.join(rootDir, imgName);
  const distImg = path.join(distDir, imgName);
  if (fs.existsSync(rootImg)) {
    fs.copyFileSync(rootImg, distImg);
  }
}

// 6. Ensure .nojekyll in both root and dist
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

console.log('🎉 Build and direct-deployment bundle ready!');
