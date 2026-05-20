import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cartId, dropoffLat, dropoffLon, dropoffAddress } = body;

    if (!cartId) {
      return Response.json({ error: "cartId required" }, { status: 400 });
    }

    const carts = await sql`
      SELECT c.id, c.buyer_id, c.facility_id, c.status FROM carts c WHERE c.id = ${cartId}
    `;
    if (carts.length === 0) return Response.json({ error: "Cart not found" }, { status: 404 });
    if (carts[0].buyer_id !== userId) return Response.json({ error: "Unauthorized" }, { status: 403 });
    if (carts[0].status !== 'confirmed' && carts[0].status !== 'partial') {
      return Response.json({ error: "Cart must be confirmed first" }, { status: 400 });
    }

    // Get facility location for pickup
    const facilities = await sql`
      SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lon FROM facilities WHERE id = ${carts[0].facility_id}
    `;

    const req = await sql`
      INSERT INTO delivery_requests (cart_id, buyer_id, facility_id, pickup_lat, pickup_lon, dropoff_lat, dropoff_lon, dropoff_address)
      VALUES (${cartId}, ${userId}, ${carts[0].facility_id},
              ${facilities[0].lat}, ${facilities[0].lon},
              ${dropoffLat || null}, ${dropoffLon || null}, ${dropoffAddress || null})
      RETURNING *
    `;

    return Response.json({ request: req[0] });
  } catch (error) {
    console.error("Error creating delivery request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
