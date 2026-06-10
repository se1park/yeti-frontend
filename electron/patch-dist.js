const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  throw new Error(`Missing Expo web export: ${indexPath}`);
}

const html = fs.readFileSync(indexPath, 'utf8');
const patched = html
  .replaceAll('src="/', 'src="./')
  .replaceAll('href="/', 'href="./');

fs.writeFileSync(indexPath, patched);
console.log('Patched Electron asset paths in dist/index.html');
