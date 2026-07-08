import { getDB } from "./database";

export async function getConversations() {
  const db = await getDB();

  const rows = await db.getAllAsync(`
    SELECT 
      m.node_id,
      c.name,
      m.text,
      m.time,
      m.created_at
    FROM messages m
    LEFT JOIN contacts c
      ON c.node_id = m.node_id
    WHERE m.id IN (
      SELECT MAX(id)
      FROM messages
      GROUP BY node_id
    )
    ORDER BY m.created_at DESC
  `);

  return rows.map((row) => ({
    id: row.node_id,
    name: row.name || row.node_id,
    nodeId: row.node_id,
    lastMessage: row.text,
    time: row.time,
    status: "Online",
  }));
}