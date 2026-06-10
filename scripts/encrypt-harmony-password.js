const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const pluginMaterial = path.resolve(
  'D:/DevEcoStudio5/DevEco Studio/tools/hvigor/hvigor-ohos-plugin/res/material'
);
const signingDir = path.resolve(__dirname, '../harmony-native/signing');
const targetMaterial = path.join(signingDir, 'material');
const component = Buffer.from([49, 243, 9, 115, 214, 175, 91, 184, 211, 190, 177, 88, 101, 131, 192, 119]);

function xor(a, b) {
  const out = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

function xorComponents(list) {
  let result = xor(list[0], list[1]);
  for (let i = 2; i < list.length; i++) result = xor(result, list[i]);
  return result;
}

function readDirBytes(dir) {
  const entries = fs.readdirSync(dir).filter((f) => f !== '.DS_Store');
  if (entries.length !== 1) throw new Error(`Invalid material dir: ${dir}`);
  return fs.readFileSync(path.join(dir, entries[0]));
}

function readFd(materialRoot) {
  const fdRoot = path.join(materialRoot, 'fd');
  return fs
    .readdirSync(fdRoot)
    .filter((f) => f !== '.DS_Store')
    .sort()
    .map((sub) => readDirBytes(path.join(fdRoot, sub)));
}

function decrypt(key, payload) {
  const r = ((payload[0] & 255) << 24) | ((payload[1] & 255) << 16) | ((payload[2] & 255) << 8) | (payload[3] & 255);
  const ivLen = payload.length - 4 - r;
  const iv = payload.subarray(4, 4 + ivLen);
  const tag = payload.subarray(payload.length - 16);
  const data = payload.subarray(4 + ivLen, payload.length - 16);
  const decipher = crypto.createDecipheriv('aes-128-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function encrypt(key, plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-128-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(plainText, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  const body = Buffer.concat([iv, encrypted, tag]);
  const r = body.length - iv.length;
  const header = Buffer.alloc(4);
  header.writeUInt32BE(r, 0);
  return Buffer.concat([header, body]).toString('hex');
}

function getKey(materialRoot) {
  const fd = readFd(materialRoot);
  const salt = readDirBytes(path.join(materialRoot, 'ac'));
  const work = readDirBytes(path.join(materialRoot, 'ce'));
  const merged = [...fd, component];
  const root = crypto.pbkdf2Sync(xorComponents(merged).toString(), salt, 10000, 16, 'sha256');
  return decrypt(root, work);
}

function copyMaterial() {
  fs.rmSync(targetMaterial, { recursive: true, force: true });
  fs.cpSync(pluginMaterial, targetMaterial, { recursive: true });
}

function main() {
  const password = process.argv[2] || 'QnZs2026!Huawei';
  copyMaterial();
  const key = getKey(targetMaterial);
  const encrypted = encrypt(key, password);
  const roundtrip = decrypt(key, Buffer.from(encrypted, 'hex')).toString('utf8');
  if (roundtrip !== password) throw new Error(`Roundtrip failed: ${roundtrip}`);
  console.log(encrypted);
}

main();
