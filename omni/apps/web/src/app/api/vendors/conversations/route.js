import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all conversations for this vendor (both request-based and direct)
    const conversations = await sql`
      WITH vendor_id AS (
        SELECT v.id
        FROM vendors v
        JOIN users u ON u.id = v.user_id
        WHERE u.id = ${session.user.id}::uuid
        LIMIT 1
      )
      SELECT DISTINCT ON (COALESCE(m.request_id::text, m.vendor_id::text))
        m.request_id,
        m.vendor_id,
        p.name as product_name,
        m.content as last_message_preview,
        m.created_at as last_message_time,
        0 as unread_count
      FROM messages m
      LEFT JOIN availability_requests ar ON ar.id = m.request_id
      LEFT JOIN products p ON p.id = ar.product_id
      WHERE (
        m.request_id IN (
          SELECT ar2.id FROM availability_requests ar2 WHERE ar2.vendor_id = (SELECT id FROM vendor_id)
        )
        OR m.vendor_id = (SELECT id FROM vendor_id)
      )
      ORDER BY COALESCE(m.request_id::text, m.vendor_id::text), m.created_at DESC
    `;

    return Response.json({ conversations });
  } catch (err) {
    console.error("GET /api/vendors/conversations error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
