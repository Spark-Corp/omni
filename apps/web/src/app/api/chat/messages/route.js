import sql from "@/app/api/utils/sql";
import { getServerSession } from "@/lib/auth";

export async function GET(request) {
  try {
    let userId;
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) {
      userId = headerUserId;
    } else {
      const session = await getServerSession(request);
      if (!session?.data?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.data.user.id;
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
    let userId;
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) {
      userId = headerUserId;
    } else {
      const session = await getServerSession(request);
      if (!session?.data?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.data.user.id;
    }

    const body = await request.json();
    const { requestId, vendorId, content } = body;

    if ((!requestId && !vendorId) || !content) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let receiverId;
    let result;

    if (requestId) {
      const [req] = await sql`
        SELECT ar.buyer_id, v.user_id as vendor_user_id
        FROM availability_requests ar
        JOIN vendors v ON v.id = ar.vendor_id
        WHERE ar.id = ${requestId}
      `;
      if (!req) {
        return Response.json({ error: "Request not found" }, { status: 404 });
      }
      receiverId = userId === req.buyer_id ? req.vendor_user_id : req.buyer_id;

      result = await sql`
        INSERT INTO messages (request_id, sender_id, receiver_id, content)
        VALUES (${requestId}, ${userId}, ${receiverId}, ${content})
        RETURNING id, content, created_at, sender_id
      `;
    } else {
      const [vendor] = await sql`
        SELECT user_id FROM vendors WHERE id = ${vendorId}
      `;
      if (!vendor) {
        return Response.json({ error: "Vendor not found" }, { status: 404 });
      }
      receiverId = vendor.user_id;

      result = await sql`
        INSERT INTO messages (vendor_id, sender_id, receiver_id, content)
        VALUES (${vendorId}, ${userId}, ${receiverId}, ${content})
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
