import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, tripId } = body;

    if (!requestId || !tripId) {
      return Response.json({ error: "requestId and tripId required" }, { status: 400 });
    }

    const profile = await sql`
      SELECT id FROM delivery_profiles WHERE user_id = ${userId}
    `;
    if (profile.length === 0) {
      return Response.json({ error: "Register as delivery person first" }, { status: 400 });
    }

    // Free tier limit: max 3 deliveries/day
    const userTier = await sql`
      SELECT delivery_tier FROM users WHERE id = ${userId}
    `;
    if (userTier.length === 0 || userTier[0].delivery_tier === 'free') {
      const todayCount = await sql`
        SELECT COUNT(*) as cnt FROM delivery_requests
        WHERE delivery_profile_id = ${profile[0].id}
          AND status = 'matched'
          AND updated_at >= CURRENT_DATE
      `;
      if (parseInt(todayCount[0].cnt) >= 3) {
        return Response.json(
          { error: "Free delivery limit reached (3/day). Upgrade to deliver more." },
          { status: 403 },
        );
      }
    }

    // Get new request's pickup/dropoff
    const newReq = await sql`
      SELECT pickup_location, dropoff_location FROM delivery_requests WHERE id = ${requestId}
    `;
    if (newReq.length === 0) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    // Already matched deliveries for this profile → conflict detection
    const existing = await sql`
      SELECT pickup_location, dropoff_location FROM delivery_requests
      WHERE delivery_profile_id = ${profile[0].id}
        AND status = 'matched'
        AND id != ${requestId}
    `;

    if (existing.length > 0) {
      // Parse new request coords from PostGIS WKT: POINT(lon lat)
      const parseWkt = (wkt) => {
        const m = wkt.match(/POINT\(([\d.-]+) ([\d.-]+)\)/i);
        return m ? { lon: parseFloat(m[1]), lat: parseFloat(m[2]) } : null;
      };

      const newPickup = parseWkt(newReq[0].pickup_location);
      const newDropoff = parseWkt(newReq[0].dropoff_location);

      if (newPickup && newDropoff) {
        for (const ex of existing) {
          const exPickup = parseWkt(ex.pickup_location);
          const exDropoff = parseWkt(ex.dropoff_location);
          if (!exPickup || !exDropoff) continue;

          // Vector angle check: direction of existing vs new
          const exDx = exDropoff.lon - exPickup.lon;
          const exDy = exDropoff.lat - exPickup.lat;
          const newDx = newDropoff.lon - newPickup.lon;
          const newDy = newDropoff.lat - newPickup.lat;

          const dot = exDx * newDx + exDy * newDy;
          const magEx = Math.sqrt(exDx * exDx + exDy * exDy);
          const magNew = Math.sqrt(newDx * newDx + newDy * newDy);

          if (magEx > 0 && magNew > 0) {
            const cosAngle = dot / (magEx * magNew);
            const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
            if (angle > 90) {
              return Response.json({
                error: "Conflit directionnel : cette livraison est en sens opposé à une livraison déjà acceptée.",
              }, { status: 409 });
            }
          }
        }
      }
    }

    const result = await sql`
      UPDATE delivery_requests
      SET status = 'matched', matched_trip_id = ${tripId}, delivery_profile_id = ${profile[0].id}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${requestId} AND status = 'looking'
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Request already taken or not available" }, { status: 409 });
    }

    return Response.json({ request: result[0] });
  } catch (error) {
    console.error("Error accepting delivery:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
