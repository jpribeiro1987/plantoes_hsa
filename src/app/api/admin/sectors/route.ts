import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function GET() {
  try {
    initDB();
    const stmt = db.prepare('SELECT * FROM sectors ORDER BY name');
    const sectors = stmt.all();
    return NextResponse.json({ sectors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const body = await req.json();
    const { name, weekday_value, weekend_value } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome do setor é obrigatório' }, { status: 400 });
    }

    // Check if exists
    const check = db.prepare('SELECT count(*) as c FROM sectors WHERE name = ?').get(name) as { c: number };
    if (check.c > 0) {
      return NextResponse.json({ error: 'Já existe um setor com este nome' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO sectors (name, weekday_value, weekend_value) VALUES (?, ?, ?)');
    const result = stmt.run(name, parseFloat(weekday_value) || 0, parseFloat(weekend_value) || 0);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar setor' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initDB();
    const body = await req.json();
    const { id, name, weekday_value, weekend_value } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID e Nome são obrigatórios' }, { status: 400 });
    }

    // Check name conflict
    const check = db.prepare('SELECT id FROM sectors WHERE name = ?').get(name) as { id: number } | undefined;
    if (check && check.id !== id) {
      return NextResponse.json({ error: 'Já existe um setor com este nome' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE sectors SET name = ?, weekday_value = ?, weekend_value = ? WHERE id = ?');
    stmt.run(name, parseFloat(weekday_value) || 0, parseFloat(weekend_value) || 0, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar setor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Optional: Block deletion if shifts exist for this sector
    const sectorNameRow = db.prepare('SELECT name FROM sectors WHERE id = ?').get(id) as { name: string } | undefined;
    if (!sectorNameRow) {
      return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 });
    }

    const checkShifts = db.prepare('SELECT count(*) as c FROM shifts WHERE shift_type = ?').get(sectorNameRow.name) as { c: number };
    if (checkShifts.c > 0) {
      return NextResponse.json({ error: 'Não é possível excluir um setor que possui plantões registrados. Para preservar o histórico, apenas zere os valores se não for mais utilizar.' }, { status: 400 });
    }

    const stmt = db.prepare('DELETE FROM sectors WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir setor' }, { status: 500 });
  }
}
