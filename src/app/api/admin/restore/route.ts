import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get the path to shifts.db
    const dbPath = path.join(process.cwd(), 'shifts.db');

    // Overwrite the file
    await fs.writeFile(dbPath, buffer);

    return NextResponse.json({ message: 'Backup restaurado com sucesso!' });
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return NextResponse.json({ error: 'Erro ao restaurar banco de dados.' }, { status: 500 });
  }
}
