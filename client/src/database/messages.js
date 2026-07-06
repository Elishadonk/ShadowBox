import { getDB } from "./database";

export async function saveMessage({ nodeId, text, mine, time }) {
  const db = await getDB();

  await db.runAsync(
    `INSERT INTO messages (node_id, text, mine, time, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [nodeId, text, mine ? 1 : 0, time, Date.now()]
  );
}

export async function getMessages(nodeId) {
  const db = await getDB();

  const rows = await db.getAllAsync(
    `SELECT * FROM messages
     WHERE node_id = ?
     ORDER BY created_at ASC`,
    [nodeId]
  );

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    mine: row.mine === 1,
    time: row.time,
  }));
}
