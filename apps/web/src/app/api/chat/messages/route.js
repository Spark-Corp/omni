import sql from "@/app/api/utils/sql";
import { authClient } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
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

    const userId = session.data.user.id;
    let messages;

    if (requestId) {
      messages = await sql`
        SELECT 
          m.id,
          m.content,
          m.created_at,
          m.sender_id,
          CASE WHEN m.sender_id = ${userId} THEN true ELSE false END as is_mine
        FROM messages m
        WHERE m.request_id = ${requestId}
        ORDER BY m.created_at ASC
      `;
    } else {
      messages = await sql`
        SELECT 
          m.id,
          m.content,
          m.created_at,
          m.sender_id,
          CASE WHEN m.sender_id = ${userId} THEN true ELSE false END as is_mine
        FROM messages m
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
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
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

    const userId = session.data.user.id;
    let result;

    if (requestId) {
      result = await sql`
        INSERT INTO messages (request_id, sender_id, content)
        VALUES (${requestId}, ${userId}, ${content})
        RETURNING id, content, created_at, sender_id
      `;
    } else {
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