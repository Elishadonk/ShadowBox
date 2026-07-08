import { getDB } from "./database";

export async function saveContact({ nodeId, name, online = false }) {
  const db = await getDB();

  await db.runAsync(
    `INSERT OR REPLACE INTO contacts
     (node_id, name, online, created_at)
     VALUES (?, ?, ?, ?)`,
    [nodeId, name, online ? 1 : 0, Date.now()]
  );
}

export async function getContacts() {
  const db = await getDB();

  const rows = await db.getAllAsync(
    `SELECT * FROM contacts
     ORDER BY name ASC`
  );

  return rows.map((row) => ({
    id: row.node_id,
    name: row.name,
    online: row.online === 1,
  }));
}

export async function deleteContact(nodeId) {
  const db = await getDB();

  await db.runAsync(
    `DELETE FROM contacts
     WHERE node_id = ?`,
    [nodeId]
  );
}