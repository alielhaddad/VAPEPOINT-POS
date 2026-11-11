'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'licenses', 'registry.json');
const manifestPath = path.join(root, 'licenses', 'manifest.json');
const privateKeyText = process.env.LICENSE_SIGNING_PRIVATE_KEY;
if (!privateKeyText) throw new Error('Missing LICENSE_SIGNING_PRIVATE_KEY GitHub Actions secret.');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
if (registry.schema !== 1 || !Array.isArray(registry.licenses)) {
  throw new Error('registry.json must contain {"schema":1,"licenses":[]}.');
}
const seen = new Set();
for (const [index, item] of registry.licenses.entries()) {
  if (!item || typeof item.licenseId !== 'string' || !item.licenseId.trim()) throw new Error(`License #${index + 1} has no licenseId.`);
  if (typeof item.hwidHash !== 'string' || !/^[a-f0-9]{64}$/i.test(item.hwidHash)) throw new Error(`License ${item.licenseId} must have a 64-character hexadecimal hwidHash.`);
  if (!['active', 'blocked'].includes(String(item.status || '').toLowerCase())) throw new Error(`License ${item.licenseId} status must be active or blocked.`);
  if (item.expiresAt !== null && item.expiresAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(item.expiresAt)) throw new Error(`License ${item.licenseId} expiresAt must be YYYY-MM-DD or null.`);
  const key = item.hwidHash.toLowerCase();
  if (seen.has(key)) throw new Error(`Duplicate HWID hash: ${item.hwidHash}`);
  seen.add(key);
}

// The signature covers the exact UTF-8 JSON bytes stored in payload.
const payload = Buffer.from(JSON.stringify(registry), 'utf8');
const privateKey = crypto.createPrivateKey(privateKeyText.replace(/\\n/g, '\n'));
const signature = crypto.sign(null, payload, privateKey);
const manifest = {
  version: 1,
  payload: payload.toString('base64'),
  signature: signature.toString('base64')
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Signed ${registry.licenses.length} license record(s) -> licenses/manifest.json`);
