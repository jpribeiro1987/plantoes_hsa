import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId');

  if (!doctorId) {
    return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
  }

  try {
    initDB();
    // Fetch active shift (end_time is null)
    const stmt = db.prepare('SELECT * FROM shifts WHERE doctor_id = ? AND end_time IS NULL');
    const shift = stmt.get(doctorId) as any;

    return NextResponse.json({ shift: shift || null });
  } catch (error) {
    console.error('Shift GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const body = await req.json();
    const { doctorId, action, shift_type } = body; // action: 'start' | 'end'

    if (!doctorId || !action) {
      return NextResponse.json({ error: 'Doctor ID and action are required' }, { status: 400 });
    }

    if (action === 'start') {
      const checkStmt = db.prepare('SELECT id FROM shifts WHERE doctor_id = ? AND end_time IS NULL');
      const activeShift = checkStmt.get(doctorId);
      
      if (activeShift) {
        return NextResponse.json({ error: 'Shift already active' }, { status: 400 });
      }

      const startTime = new Date().toISOString();
      const insertStmt = db.prepare('INSERT INTO shifts (doctor_id, start_time, shift_type) VALUES (?, ?, ?)');
      const result = insertStmt.run(doctorId, startTime, shift_type || 'PRONTOCLINICA');

      return NextResponse.json({ success: true, shiftId: result.lastInsertRowid, startTime });
    } else if (action === 'end') {
      const checkStmt = db.prepare('SELECT id FROM shifts WHERE doctor_id = ? AND end_time IS NULL');
      const activeShift = checkStmt.get(doctorId) as { id: number } | undefined;

      if (!activeShift) {
        return NextResponse.json({ error: 'No active shift found' }, { status: 400 });
      }

      const endTime = new Date().toISOString();
      const updateStmt = db.prepare('UPDATE shifts SET end_time = ? WHERE id = ?');
      updateStmt.run(endTime, activeShift.id);

      return NextResponse.json({ success: true, endTime });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Shift POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
