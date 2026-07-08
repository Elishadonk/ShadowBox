import { getDB } from "./database";

export async function getConversations() {
  const db = await getDB();

  const rows = await db.getAllAsync(`
    SELECT 
      node_id,
      text,
      time,
      created_at
    FROM messages
    WHERE id IN (
      SELECT MAX(id)
      FROM messages
      GROUP BY node_id
    )
    ORDER BY created_at DESC
  `);

  return rows.map((row) => ({
    id: row.node_id,
    lastMessage: row.text,
    time: row.time,
    status: "Online",
  }));
}