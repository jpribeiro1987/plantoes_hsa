import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';
import { createObjectCsvStringifier } from 'csv-writer';
import { calculateShiftValue } from '@/lib/calculations';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // Format: YYYY-MM

  if (!month) {
    return NextResponse.json({ error: 'Month parameter (YYYY-MM) is required' }, { status: 400 });
  }

  try {
    initDB();
    
    // Fetch shifts for the given month
    const stmt = db.prepare(`
      SELECT 
        s.id, 
        d.name as doctor_name, 
        s.start_time, 
        s.end_time,
        s.shift_type
      FROM shifts s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.start_time LIKE ?
      ORDER BY s.start_time ASC
    `);
    
    const shifts = stmt.all(`${month}%`) as any[];

    if (shifts.length === 0) {
      return NextResponse.json({ error: 'No shifts found for this month' }, { status: 404 });
    }

    // Fetch settings
    const settingsStmt = db.prepare('SELECT key, value FROM settings');
    const settingsRows = settingsStmt.all() as { key: string; value: string }[];
    const settings = settingsRows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    // Format data for CSV
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'Shift ID' },
        { id: 'doctor_name', title: 'Doctor Name' },
        { id: 'start_time', title: 'Start Time' },
        { id: 'end_time', title: 'End Time' },
        { id: 'duration', title: 'Duration (Hours)' },
        { id: 'shift_type', title: 'Shift Type' },
        { id: 'value', title: 'Value (R$)' }
      ]
    });

    const records = shifts.map(shift => {
      let durationStr = 'N/A';
      if (shift.end_time) {
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        durationStr = durationHours.toFixed(2);
      }

      const value = calculateShiftValue(shift.shift_type, shift.start_time, shift.end_time, settings);

      return {
        id: shift.id,
        doctor_name: shift.doctor_name,
        start_time: new Date(shift.start_time).toLocaleString('pt-BR'),
        end_time: shift.end_time ? new Date(shift.end_time).toLocaleString('pt-BR') : 'Active',
        duration: durationStr,
        shift_type: shift.shift_type || 'PRONTOCLINICA',
        value: value.toFixed(2).replace('.', ',')
      };
    });

    const header = csvStringifier.getHeaderString();
    const recordsCsv = csvStringifier.stringifyRecords(records);
    const csvContent = header + recordsCsv;

    // Return as a downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="medical_shifts_${month}.csv"`
      }
    });

  } catch (error) {
    console.error('Report GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
