/**
 * Writes public/runtime-config.js before production build.
 * Override via Netlify env: JGG_API_URL, JGG_VAPID_PUBLIC_KEY
 */
const fs = require('fs');
const path = require('path');

const apiUrl =
  process.env.JGG_API_URL || 'https://jay-girnari-group.onrender.com/api';
const vapidPublicKey =
  process.env.JGG_VAPID_PUBLIC_KEY ||
  'BOCS9JpA3fDzTCcgvc-RcQZ828Hn-cnao32wAP_GG13hucbtwlDnhydy6V9bMdrpLG3kGwkinao0zIcraMP5Bm4';

const outPath = path.join(__dirname, '..', 'public', 'runtime-config.js');
const content = `window.__JGG_CONFIG__=${JSON.stringify({ apiUrl, vapidPublicKey })};\n`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('[runtime-config]', outPath, '→', apiUrl);
