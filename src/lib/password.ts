import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

/** `needsRehash` indica um hash bcrypt antigo que deve ser regravado em scrypt. */
export async function verifyPassword(password: string, stored: string): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (stored.startsWith('scrypt$')) {
    const [, saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex) return { ok: false, needsRehash: false };
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), 64);
    return { ok: expected.length === actual.length && timingSafeEqual(expected, actual), needsRehash: false };
  }
  if (stored.startsWith('$2')) {
    const ok = await bcrypt.compare(password, stored);
    return { ok, needsRehash: ok };
  }
  return { ok: false, needsRehash: false };
}
