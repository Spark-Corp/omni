import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const vendorId = searchParams.get("vendorId");

    if (!requestId && !vendorId) {
      return Response.json(
        { error: "Missing requestId or vendorId" },
        { status: 400 },
      );
    }

    let messages;
    const userId = session.user.id;

    if (requestId) {
      // Get messages for this availability request
      messages = await sql`
        SELECT 
          m.id,
          m.content,
          m.created_at,
          m.sender_id,
          u.phone as sender_name,
          CASE WHEN m.sender_id = ${userId} THEN true ELSE false END as is_mine
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.request_id = ${requestId}
        ORDER BY m.created_at ASC
      `;
    } else {
      // Get messages for direct vendor chat
      messages = await sql`
        SELECT 
          m.id,
          m.content,
          m.created_at,
          m.sender_id,
          u.phone as sender_name,
          CASE WHEN m.sender_id = ${userId} THEN true ELSE false END as is_mine
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.vendor_id = ${vendorId}
          AND (
            m.sender_id = ${userId} OR
            EXISTS (
              SELECT 1 FROM vendors v 
              WHERE v.id = ${vendorId} AND v.user_id = ${userId}
            )
          )
        ORDER BY m.created_at ASC
      `;
    }

    return Response.json({ messages });
  } catch (err) {
    console.error("GET /api/chat/messages error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, vendorId, content } = body;

    if ((!requestId && !vendorId) || !content) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    let result;
    if (requestId) {
      // Insert message for availability request
      result = await sql`
        INSERT INTO messages (request_id, sender_id, content)
        VALUES (${requestId}, ${userId}, ${content})
        RETURNING id, content, created_at, sender_id
      `;
    } else {
      // Insert message for direct vendor chat
      result = await sql`
        INSERT INTO messages (vendor_id, sender_id, content)
        VALUES (${vendorId}, ${userId}, ${content})
        RETURNING id, content, created_at, sender_id
      `;
    }

    const message = result[0];

    return Response.json({ message, success: true });
  } catch (err) {
    console.error("POST /api/chat/messages error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
