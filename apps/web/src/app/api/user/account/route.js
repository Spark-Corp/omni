import sql from "@/app/api/utils/sql";

export async function DELETE(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // CASCADE: vendors → products, favorites, availability_requests, messages
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/user/account error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
