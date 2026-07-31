const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = ['.js', '.jsx', '.ts', '.tsx', '.css'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
      walk(full);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (!exts.includes(ext)) continue;
      // Only strip in backend/src and frontend/src
      if (!full.includes(path.join('backend', 'src')) && !full.includes(path.join('frontend', 'src'))) continue;
      try {
        let src = fs.readFileSync(full, 'utf8');
        // Remove block comments
        src = src.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove line comments
        src = src.replace(/(^|[^:\\])\/\/.*$/gm, '$1');
        // Trim trailing whitespace on lines
        src = src.split('\n').map(l => l.replace(/\s+$/,'')).join('\n');
        fs.writeFileSync(full, src, 'utf8');
        console.log('Stripped comments:', full);
      } catch (err) {
        console.error('Failed:', full, err.message);
      }
    }
  }
}

walk(root);
console.log('Done stripping comments.');
