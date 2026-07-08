import { getDB } from "./database";

async function ensureProfileTable() {
  const db = await getDB();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      node_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

function generateNodeId() {
  const number = Math.floor(100000 + Math.random() * 900000);
  return `SBX-${number}`;
}

export async function getProfile() {
  await ensureProfileTable();

  const db = await getDB();

  const existing = await db.getFirstAsync(
    `SELECT * FROM profile WHERE id = 1`
  );

  if (existing) {
    return {
      nodeId: existing.node_id,
      displayName: existing.display_name,
    };
  }

  const nodeId = generateNodeId();
  const displayName = "Shadow User";

  await db.runAsync(
    `INSERT INTO profile (id, node_id, display_name, created_at)
     VALUES (1, ?, ?, ?)`,
    [nodeId, displayName, Date.now()]
  );

  return {
    nodeId,
    displayName,
  };
}

export async function updateDisplayName(displayName) {
  await ensureProfileTable();

  const db = await getDB();

  await db.runAsync(
    `UPDATE profile
     SET display_name = ?
     WHERE id = 1`,
    [displayName]
  );
}