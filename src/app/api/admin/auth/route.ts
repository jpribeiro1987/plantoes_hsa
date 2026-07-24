import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    initDB();
    const { username, password } = await req.json();

    const stmt = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ? AND is_active = 1');
    const admin = stmt.get(username, password);

    if (admin) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Usuário ou senha incorretos, ou inativo' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro de validação' }, { status: 500 });
  }
}
