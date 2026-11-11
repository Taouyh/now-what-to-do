const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist/web');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const html = source.replace('<script type="module" src="/src/main.ts"></script>', '<!-- native-bridge --><script src="app.js"></script>');
fs.writeFileSync(path.join(output, 'index.html'), html);
fs.cpSync(path.join(root, 'public/assets'), path.join(output, 'assets'), { recursive: true });
// Keep original design PNGs in source, but ship only their compact WebP derivatives.
for (const name of ['paper-left','paper-right','bookmark','scroll-paper','environment','task-paper']) {
  fs.rmSync(path.join(output, 'assets', `${name}.png`), { force: true });
}
fs.rmSync(path.join(output, 'app.js.map'), { force: true });
fs.mkdirSync(path.join(output, 'packaging'), { recursive: true });
fs.copyFileSync(path.join(root, 'packaging/icon.png'), path.join(output, 'packaging/icon.png'));
const manifest = [];
function visit(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isDirectory()) visit(full);
    else manifest.push({ path: path.relative(output, full).replaceAll('\\', '/'), bytes: fs.statSync(full).size });
  }
}
visit(output);
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Assembled ${manifest.length} files in dist/web`);
