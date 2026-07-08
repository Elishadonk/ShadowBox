import * as SQLite from "expo-sqlite";

let db = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("shadowbox.db");
  }

  return db;
}

export async function initDatabase() {
  const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id TEXT NOT NULL,
      text TEXT NOT NULL,
      mine INTEGER NOT NULL,
      time TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      node_id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      online INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      node_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await ensureMessageTypeColumns(database);
}

async function ensureMessageTypeColumns(database) {
  const columns = await database.getAllAsync(`PRAGMA table_info(messages)`);

  const hasType = columns.some((column) => column.name === "type");
  const hasContent = columns.some((column) => column.name === "content");

  if (!hasType) {
    await database.execAsync(`
      ALTER TABLE messages ADD COLUMN type TEXT NOT NULL DEFAULT 'text';
    `);
  }

  if (!hasContent) {
    await database.execAsync(`
      ALTER TABLE messages ADD COLUMN content TEXT;
    `);

    await database.execAsync(`
      UPDATE messages SET content = text WHERE content IS NULL;
    `);
  }
}