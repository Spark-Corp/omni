import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return new Response(JSON.stringify({ notifications: [], unread_count: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const notifications = await sql(
      "SELECT id, type, title, message, link, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );

    const unread_count = notifications.filter(n => !n.is_read).length;

    return new Response(JSON.stringify({ notifications, unread_count }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /notifications error:", err?.message);
    return new Response(JSON.stringify({ notifications: [], unread_count: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await sql(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PUT /notifications error:", err?.message);
    return new Response(JSON.stringify({ error: "Failed to update" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}