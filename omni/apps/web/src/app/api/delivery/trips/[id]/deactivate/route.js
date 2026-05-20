import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await sql`
      UPDATE delivery_planned_trips SET is_active = false
      WHERE id = ${id} AND delivery_profile_id = (
        SELECT id FROM delivery_profiles WHERE user_id = ${userId}
      )
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deactivating trip:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
