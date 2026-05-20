import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveries = await sql`
      SELECT dr.id, dr.cart_id, dr.status, dr.dropoff_address, dr.delivery_fee,
        dr.distance_km, dr.created_at,
        f.name as facility_name, f.category as facility_category
      FROM delivery_requests dr
      JOIN facilities f ON f.id = dr.facility_id
      WHERE dr.delivery_profile_id = (
        SELECT id FROM delivery_profiles WHERE user_id = ${userId}
      ) AND dr.status IN ('matched', 'picked_up', 'in_transit')
      ORDER BY dr.created_at DESC
    `;

    return Response.json({ deliveries });
  } catch (error) {
    console.error("Error fetching active deliveries:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
