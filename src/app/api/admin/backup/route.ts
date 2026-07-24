import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'shifts.db');
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `shifts-backup-${timestamp}.db`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/x-sqlite3',
      },
    });
  } catch (error) {
    console.error('Error generating backup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
