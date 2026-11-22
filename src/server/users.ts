import { z } from 'zod';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/entities';
import { hashPassword, verifyPassword } from '@/lib/password';
import { assertAdmin, InputError, zodFields } from './guard';

const repo = async () => (await getDb()).getRepository('User');

/**
 * Valida credenciais. Com a tabela vazia, ADMIN_EMAIL/ADMIN_PASSWORD criam o primeiro administrador.
 * Hashes bcrypt antigos são aceites e regravados em scrypt.
 */
export async function authenticate(emailRaw: string, password: string): Promise<User | null> {
  const email = emailRaw.trim().toLowerCase();
  const users = await repo();

  if ((await users.count()) === 0) {
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envEmail && envPassword && email === envEmail && password === envPassword) {
      return (await users.save({ email, name: 'Administrador', passwordHash: await hashPassword(password), lastLoginAt: new Date() })) as User;
    }
    return null;
  }

  const user = (await users.findOne({ where: { email } })) as User | null;
  // Mesmo sem utilizador, calcula um hash para não revelar pela duração se o email existe.
  const check = user ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), { ok: false, needsRehash: false });
  if (!user || !check.ok) return null;
  await users.update(user.id, {
    lastLoginAt: new Date(),
    ...(check.needsRehash ? { passwordHash: await hashPassword(password) } : {}),
  });
  return user;
}

export async function listAdmins() {
  await assertAdmin();
  const rows = (await (await repo()).find({ order: { createdAt: 'ASC' } })) as User[];
  return rows.map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt ?? null }));
}

const newUserSchema = z.object({
  name: z.string().trim().min(2, 'Indique o nome.').max(160),
  email: z.string().trim().toLowerCase().email('Email inválido.').max(200),
  password: z.string().min(10, 'Mínimo 10 caracteres.').max(200),
});

export async function createAdmin(input: unknown) {
  await assertAdmin();
  const parsed = newUserSchema.safeParse(input);
  if (!parsed.success) throw new InputError('Verifique os campos.', zodFields(parsed.error));
  const users = await repo();
  if (await users.findOne({ where: { email: parsed.data.email } })) throw new InputError('Já existe um utilizador com este email.', { email: 'Email já registado.' });
  const u = (await users.save({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) })) as User;
  return { id: u.id };
}

export async function removeAdmin(id: string) {
  const me = await assertAdmin();
  if (id === me.uid) throw new InputError('Não pode remover a sua própria conta.');
  const users = await repo();
  if ((await users.count()) <= 1) throw new InputError('Tem de existir pelo menos um administrador.');
  await users.delete(id);
}

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Indique a palavra-passe atual.'),
    next: z.string().min(10, 'Mínimo 10 caracteres.').max(200),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ['confirm'], message: 'As palavras-passe não coincidem.' });

export async function changePassword(input: unknown) {
  const me = await assertAdmin();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) throw new InputError('Verifique os campos.', zodFields(parsed.error));
  const users = await repo();
  const user = (await users.findOne({ where: { id: me.uid } })) as User | null;
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash)).ok) {
    throw new InputError('A palavra-passe atual está incorreta.', { current: 'Palavra-passe incorreta.' });
  }
  await users.update(user.id, { passwordHash: await hashPassword(parsed.data.next) });
}
