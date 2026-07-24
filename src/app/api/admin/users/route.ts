import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function GET() {
  try {
    initDB();
    const stmt = db.prepare('SELECT id, username, is_active FROM admins ORDER BY id ASC');
    const admins = stmt.all();
    return NextResponse.json({ admins });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });

    try {
      const stmt = db.prepare('INSERT INTO admins (username, password, is_active) VALUES (?, ?, 1)');
      stmt.run(username, password);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: 'Nome de usuário já existe' }, { status: 400 });
      }
      throw e;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao criar administrador' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initDB();
    const { id, is_active, password } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    if (password !== undefined) {
      const stmt = db.prepare('UPDATE admins SET password = ? WHERE id = ?');
      stmt.run(password, id);
    }
    
    if (is_active !== undefined) {
      // Prevent deactivating the last active admin
      if (is_active === 0) {
        const checkStmt = db.prepare('SELECT COUNT(*) as count FROM admins WHERE is_active = 1');
        const result = checkStmt.get() as { count: number };
        if (result.count <= 1) {
          const targetStmt = db.prepare('SELECT is_active FROM admins WHERE id = ?');
          const target = targetStmt.get(id) as { is_active: number };
          if (target && target.is_active === 1) {
            return NextResponse.json({ error: 'Não é possível inativar o único administrador ativo' }, { status: 400 });
          }
        }
      }

      const stmt = db.prepare('UPDATE admins SET is_active = ? WHERE id = ?');
      stmt.run(is_active, id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}
