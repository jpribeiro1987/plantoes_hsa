import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';
import { calculateShiftValue } from '@/lib/calculations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Mês inválido. Formato esperado: YYYY-MM' }, { status: 400 });
    }

    initDB();

    // Start of the month
    const startDate = `${month}-01T00:00:00.000Z`;
    
    // Calculate start of next month
    const [year, monthNum] = month.split('-');
    let nextYear = parseInt(year);
    let nextMonth = parseInt(monthNum) + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01T00:00:00.000Z`;

    const doctorId = searchParams.get('doctorId');

    let query = `
      SELECT 
        s.id,
        d.name as doctor_name,
        s.start_time,
        s.end_time,
        s.shift_type
      FROM shifts s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.start_time >= ? AND s.start_time < ?
    `;

    const params: any[] = [startDate, endDate];

    if (doctorId) {
      query += ` AND s.doctor_id = ?`;
      params.push(parseInt(doctorId));
    }

    query += ` ORDER BY s.start_time ASC`;

    const stmt = db.prepare(query);
    const shifts = stmt.all(...params) as any[];

    // Fetch settings
    const settingsStmt = db.prepare('SELECT key, value FROM settings');
    const settingsRows = settingsStmt.all() as { key: string; value: string }[];
    const settings = settingsRows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    const shiftsWithValues = shifts.map(shift => ({
      ...shift,
      value: calculateShiftValue(shift.shift_type, shift.start_time, shift.end_time, settings)
    }));

    return NextResponse.json({ shifts: shiftsWithValues });
  } catch (error) {
    console.error('Error fetching JSON report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
