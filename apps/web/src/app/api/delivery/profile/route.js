import sql from "@/app/api/utils/sql";

export async function PUT(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone } = body;

    const existing = await sql`
      SELECT id FROM delivery_profiles WHERE user_id = ${userId}
    `;
    if (existing.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    await sql`
      UPDATE delivery_profiles SET full_name = ${fullName}, phone = ${phone}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existing[0].id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating delivery profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await sql`
      SELECT dp.*, u.delivery_tier,
        (SELECT jsonb_agg(jsonb_build_object('id', dv.id, 'type', dv.type, 'is_active', dv.is_active))
         FROM delivery_vehicles dv WHERE dv.delivery_profile_id = dp.id) as vehicles,
        (SELECT COUNT(*) FROM delivery_planned_trips dpt WHERE dpt.delivery_profile_id = dp.id AND dpt.is_active = true) as active_trips
      FROM delivery_profiles dp
      JOIN users u ON u.id = dp.user_id
      WHERE dp.user_id = ${userId}
    `;

    if (profiles.length === 0) {
      return Response.json({ profile: null });
    }

    return Response.json({ profile: profiles[0] });
  } catch (error) {
    console.error("Error fetching delivery profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
