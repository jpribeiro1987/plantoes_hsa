import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// Configura o banco de dados SQLite local no diretório do projeto
const dbPath = path.join(process.cwd(), 'shifts.db');
const db = new DatabaseSync(dbPath);

// Inicializa as tabelas se não existirem
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      reason TEXT,
      shift_type TEXT DEFAULT 'PRONTOCLINICA',
      FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default settings
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (checkSettings.count === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('pronto_weekday', '1350.00');
    insertSetting.run('pronto_weekend', '1400.00');
    insertSetting.run('uti_weekday', '1419.00');
    insertSetting.run('uti_weekend', '1471.00');
  }

  try {
    db.exec('ALTER TABLE shifts ADD COLUMN reason TEXT;');
  } catch (e) {}
  
  try {
    db.exec("ALTER TABLE shifts ADD COLUMN shift_type TEXT DEFAULT 'PRONTOCLINICA';");
  } catch (e) {}

  // Insere médicos de teste se a tabela estiver vazia
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM doctors');
  const result = countStmt.get() as { count: number };
  if (result.count === 0) {
    const insertDoc = db.prepare('INSERT INTO doctors (name, code) VALUES (?, ?)');
    insertDoc.run('Dr. João Silva', '1234');
    insertDoc.run('Dra. Maria Souza', '5678');
  }

  // Insere admin padrão se a tabela estiver vazia
  const countAdminsStmt = db.prepare('SELECT COUNT(*) as count FROM admins');
  const resultAdmins = countAdminsStmt.get() as { count: number };
  if (resultAdmins.count === 0) {
    const insertAdmin = db.prepare('INSERT INTO admins (username, password, is_active) VALUES (?, ?, 1)');
    insertAdmin.run('admin', 'admin123');
  }
}

export { db };
