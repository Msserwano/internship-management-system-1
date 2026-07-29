// backend/scripts/diagnose.js
/**
 * Simple diagnostic script to check installed packages and key env vars
 * Run: node scripts/diagnose.js
 */
const fs = require('fs');
const path = require('path');

const requiredPkgs = [
  'express','cors','dotenv','pg','nodemailer','zod','jsonwebtoken','bcryptjs'
];
const optionalPkgs = ['helmet','compression','swagger-ui-express','swagger-jsdoc'];

console.log('\nKCCA IMS Backend Diagnostic Report\n');

// Check package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('Cannot find package.json at', pkgPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

console.log('Node version:', process.version);
console.log('Project name:', pkg.name, 'version', pkg.version);

// Helper to test require
const testRequire = (name) => {
  try {
    require(name);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

console.log('\nChecking required packages:');
requiredPkgs.forEach((p) => {
  const r = testRequire(p);
  console.log(` - ${p}: ${r.ok ? 'installed' : 'MISSING'}`);
});

console.log('\nChecking optional packages:');
optionalPkgs.forEach((p) => {
  const r = testRequire(p);
  console.log(` - ${p}: ${r.ok ? 'installed' : 'not installed (optional)'}`);
});

console.log('\nEnvironment variables check:');
const envChecks = [
  'NODE_ENV','PORT','DATABASE_URL','JWT_SECRET','EMAIL_USER','EMAIL_PASSWORD','SMTP_HOST','SMTP_PORT','FRONTEND_URL'
];
envChecks.forEach((v) => {
  console.log(` - ${v}:`, process.env[v] ? 'SET' : 'NOT SET');
});

console.log('\nQuick file checks:');
const files = [
  'src/app.js','src/server.js','src/controllers/authController.js','src/config/mailer.js'
];
files.forEach((f) => {
  const p = path.join(__dirname, '..', f);
  console.log(` - ${f}:`, fs.existsSync(p) ? 'exists' : 'MISSING');
});

console.log('\nDiagnostics complete.');

// Suggest next steps
console.log('\nSuggested next steps:');
console.log(' - If any REQUIRED packages are missing, run: npm install <package>');
console.log(' - Ensure DATABASE_URL points to a running Postgres instance if you intend to use PostgreSQL.');
console.log(' - Set EMAIL_USER and EMAIL_PASSWORD for SMTP or rely on console fallback.');
console.log(' - Run `npm run dev` to start the server and observe runtime logs.');
console.log('\n');
