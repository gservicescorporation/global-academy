'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE, signSession } from '@/lib/session';
import { deleteCourse, duplicateCourse, reorderCourses, saveCourse, toggleCourse } from '@/server/courses';
import { setEnrollmentStatus } from '@/server/enrollments';
import { run, type Result } from '@/server/guard';
import { deleteResource, reorderResource, saveResource, toggleResource } from '@/server/resources';
import { saveSettings } from '@/server/settings';
import { authenticate, changePassword, createAdmin, removeAdmin } from '@/server/users';
import { getDb } from '@/lib/db';
import { assertAdmin } from '@/server/guard';
import { revalidatePath } from 'next/cache';

/* ------------------------------ Sessão ------------------------------ */

const attempts = new Map<string, { n: number; until: number }>();

export type LoginState = { error?: string };

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const password = String(fd.get('password') ?? '').slice(0, 200);
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  const key = `${ip}:${email}`;

  const a = attempts.get(key);
  if (a && a.n >= 5 && Date.now() < a.until) return { error: 'Demasiadas tentativas. Tente novamente dentro de 15 minutos.' };
  if (!email || !password) return { error: 'Indique o email e a palavra-passe.' };

  const user = await authenticate(email, password);
  if (!user) {
    attempts.set(key, { n: (a?.n ?? 0) + 1, until: Date.now() + 15 * 60_000 });
    return { error: 'Email ou palavra-passe incorretos.' };
  }
  attempts.delete(key);

  const token = await signSession({ uid: user.id, email: user.email });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 3600,
  });
  const next = String(fd.get('next') ?? '');
  // Só caminhos internos do painel (evita redirecionamentos abertos).
  redirect(/^\/admin(\/[\w\-/]*)?$/.test(next) ? next : '/admin');
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect('/admin/login');
}

/* ------------------------------ Cursos ------------------------------ */

export async function saveCourseAction(id: string | null, input: unknown) {
  return run(() => saveCourse(id, input), 'Curso guardado.');
}
export async function duplicateCourseAction(id: string) {
  return run(() => duplicateCourse(id), 'Cópia criada como rascunho.');
}
export async function deleteCourseAction(id: string) {
  return run(() => deleteCourse(id), 'Curso apagado.');
}
export async function toggleCourseAction(id: string, field: 'published' | 'featured') {
  return run(() => toggleCourse(id, field));
}
export async function reorderCoursesAction(ids: string[]) {
  return run(() => reorderCourses(ids), 'Ordem guardada.');
}

/* ------------------------------ Listas simples ------------------------------ */

export async function saveResourceAction(key: string, id: string | null, input: Record<string, unknown>) {
  return run(() => saveResource(key, id, input), 'Guardado.');
}
export async function deleteResourceAction(key: string, id: string) {
  return run(() => deleteResource(key, id), 'Apagado.');
}
export async function reorderResourceAction(key: string, ids: string[]) {
  return run(() => reorderResource(key, ids), 'Ordem guardada.');
}
export async function toggleResourceAction(key: string, id: string, field: string) {
  return run(() => toggleResource(key, id, field));
}

/* ------------------------------ Definições, inscrições, mensagens ------------------------------ */

export async function saveSettingsAction(values: Record<string, unknown>) {
  return run(() => saveSettings(values), 'Conteúdo guardado.');
}

export async function setEnrollmentStatusAction(id: string, status: string) {
  return run(() => setEnrollmentStatus(id, status), 'Estado atualizado.');
}

export async function setMessageReadAction(id: string, read: boolean): Promise<Result> {
  return run(async () => {
    await assertAdmin();
    await (await getDb()).getRepository('ContactMessage').update(id, { read });
    revalidatePath('/admin', 'layout');
    return undefined;
  });
}

export async function deleteMessageAction(id: string): Promise<Result> {
  return run(async () => {
    await assertAdmin();
    await (await getDb()).getRepository('ContactMessage').delete(id);
    revalidatePath('/admin', 'layout');
    return undefined;
  }, 'Mensagem apagada.');
}

/* ------------------------------ Utilizadores ------------------------------ */

export async function createAdminAction(input: unknown) {
  return run(() => createAdmin(input), 'Utilizador adicionado.');
}
export async function removeAdminAction(id: string) {
  return run(() => removeAdmin(id), 'Utilizador removido.');
}
export async function changePasswordAction(input: unknown) {
  return run(() => changePassword(input), 'Palavra-passe alterada.');
}
