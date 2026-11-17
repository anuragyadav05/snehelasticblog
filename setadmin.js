// Usage: node set-admin.js <admin-email> <admin-panel-password> [public-folder | index.html]
// Writes public/admin-settings.js (email + password hash) and firestore.rules for that admin email.
const fs = require('fs'), path = require('path');
const [email, pass, dir = 'public'] = process.argv.slice(2);
if (!email || !pass) { console.error('Usage: node set-admin.js <admin-email> <password> [public-folder]'); process.exit(1); }
const cyrb53 = (str, seed = 0) => { let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed; for (let i = 0, ch; i < str.length; i++) { ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909); return 4294967296 * (2097151 & h2) + (h1 >>> 0); };
const e = email.trim().toLowerCase();
const settings = JSON.stringify({ email: e, pw: cyrb53(pass + '|sneh-admin').toString(36) });
if (dir.endsWith('.html')) {
  const h = fs.readFileSync(dir, 'utf8');
  if (!h.includes('/*ADMIN_SETTINGS*/')) throw new Error('Not a blog index.html');
  fs.writeFileSync(dir, h.replace(/\/\*ADMIN_SETTINGS\*\/[\s\S]*?\/\*END_ADMIN_SETTINGS\*\//, () => '/*ADMIN_SETTINGS*/window.SNEH_ADMIN=' + settings + ';/*END_ADMIN_SETTINGS*/'));
} else fs.writeFileSync(path.join(dir, 'admin-settings.js'), '/* Written by set-admin.js */\nwindow.SNEH_ADMIN=' + settings + ';\n');
fs.writeFileSync('firestore.rules', fs.readFileSync(path.join(__dirname, 'firestore.rules.template'), 'utf8').replace(/__ADMIN_EMAIL__/g, e));
console.log('Done: admin settings and firestore.rules written for ' + e);
