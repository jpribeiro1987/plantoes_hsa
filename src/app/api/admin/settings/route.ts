import { NextResponse } from 'next/server';
import { db, initDB } from '@/lib/db';

export async function GET() {
  try {
    initDB();
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as { key: string; value: string }[];
    
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initDB();
    const body = await req.json();
    const settings = body.settings as Record<string, string>;
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    const updateStmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    
    // Run all updates in a transaction
    db.exec('BEGIN TRANSACTION');
    try {
      for (const [key, value] of Object.entries(settings)) {
        updateStmt.run(value, key);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
