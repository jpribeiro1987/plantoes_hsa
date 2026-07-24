import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    initDB();
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT id, name FROM doctors WHERE code = ?');
    const doctor = stmt.get(code) as { id: number; name: string } | undefined;

    if (!doctor) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
