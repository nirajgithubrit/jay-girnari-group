const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../dist/frontend/browser/ngsw-worker.js');
const pushPath = path.join(__dirname, '../src/push-listener.js');

if (!fs.existsSync(swPath)) {
  console.warn('ngsw-worker.js not found — skip push listener append');
  process.exit(0);
}

const pushCode = fs.readFileSync(pushPath, 'utf8');
let sw = fs.readFileSync(swPath, 'utf8');

if (!sw.includes('jgg-fund-reminder')) {
  sw += '\n' + pushCode;
  fs.writeFileSync(swPath, sw);
  console.log('Push listener appended to ngsw-worker.js');
}
