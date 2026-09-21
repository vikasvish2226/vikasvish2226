import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPassword(password, storedPassword) {
  const [salt, storedHash] = String(storedPassword || '').split(':');
  if (!salt || !storedHash) return false;

  const derivedKey = await scrypt(password, salt, 64);
  const expectedHash = Buffer.from(storedHash, 'hex');
  const actualHash = Buffer.from(derivedKey);
  return expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
}