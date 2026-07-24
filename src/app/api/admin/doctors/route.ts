import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function GET() {
  try {
    initDB();
    const stmt = db.prepare('SELECT id, name, code, allowed_unit FROM doctors ORDER BY name ASC');
    const doctors = stmt.all();
    return NextResponse.json({ doctors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const { name, code, allowed_unit } = await req.json();
    if (!name || !code) return NextResponse.json({ error: 'Name and code required' }, { status: 400 });
    
    const unit = allowed_unit || 'ALL';

    const stmt = db.prepare('INSERT INTO doctors (name, code, allowed_unit) VALUES (?, ?, ?)');
    const result = stmt.run(name, code, unit);
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Doctor code already in use' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initDB();
    const { id, name, code, allowed_unit } = await req.json();
    if (!id || !name || !code) return NextResponse.json({ error: 'ID, name and code required' }, { status: 400 });
    
    const unit = allowed_unit || 'ALL';

    const stmt = db.prepare('UPDATE doctors SET name = ?, code = ?, allowed_unit = ? WHERE id = ?');
    stmt.run(name, code, unit, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Doctor code already in use' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    initDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    db.exec('BEGIN TRANSACTION');
    // Optional: Delete related shifts or set them to null. We'll delete them.
    const delShifts = db.prepare('DELETE FROM shifts WHERE doctor_id = ?');
    delShifts.run(id);

    const delDoc = db.prepare('DELETE FROM doctors WHERE id = ?');
    delDoc.run(id);
    db.exec('COMMIT');

    return NextResponse.json({ success: true });
  } catch (error) {
    db.exec('ROLLBACK');
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}
