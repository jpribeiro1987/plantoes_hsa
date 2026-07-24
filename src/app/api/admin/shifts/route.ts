import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function GET() {
  try {
    initDB();
    // Get last 100 shifts
    const stmt = db.prepare(`
      SELECT s.id, s.doctor_id, s.start_time, s.end_time, s.reason, s.shift_type, d.name as doctor_name
      FROM shifts s
      JOIN doctors d ON s.doctor_id = d.id
      ORDER BY s.start_time DESC
      LIMIT 100
    `);
    const shifts = stmt.all();
    return NextResponse.json({ shifts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const { doctor_id, start_time, end_time, reason, shift_type } = await req.json();
    if (!doctor_id || !start_time || !reason || !shift_type) return NextResponse.json({ error: 'Médico, Início, Justificativa e Tipo são obrigatórios' }, { status: 400 });

    const stmt = db.prepare('INSERT INTO shifts (doctor_id, start_time, end_time, reason, shift_type) VALUES (?, ?, ?, ?, ?)');
    stmt.run(doctor_id, start_time, end_time || null, reason, shift_type);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao criar plantão' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initDB();
    const { id, start_time, end_time, reason, shift_type } = await req.json();
    if (!id || !start_time || !reason || !shift_type) return NextResponse.json({ error: 'Início, Justificativa e Tipo são obrigatórios' }, { status: 400 });

    const stmt = db.prepare('UPDATE shifts SET start_time = ?, end_time = ?, reason = ?, shift_type = ? WHERE id = ?');
    stmt.run(start_time, end_time || null, reason, shift_type, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const stmt = db.prepare('DELETE FROM shifts WHERE id = ?');
    stmt.run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}
