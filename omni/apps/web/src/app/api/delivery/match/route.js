import sql from "@/app/api/utils/sql";

function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function pointToSegmentDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx*dx + dy*dy;
  if (lenSq === 0) return haversineDist(px, py, ax, ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const nearX = ax + t * dx, nearY = ay + t * dy;
  return haversineDist(px, py, nearX, nearY);
}

export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await request.json();
    if (!tripId) {
      return Response.json({ error: "tripId required" }, { status: 400 });
    }

    const trips = await sql`SELECT * FROM delivery_planned_trips WHERE id = ${tripId}`;
    if (trips.length === 0) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }

    const trip = trips[0];
    const points = [
      { lat: Number(trip.origin_lat), lon: Number(trip.origin_lon) },
      ...(trip.waypoints || []).map(w => ({ lat: w.lat, lon: w.lon })),
      { lat: Number(trip.destination_lat), lon: Number(trip.destination_lon) },
    ];

    const requests = await sql`
      SELECT dr.*, f.name as facility_name,
        ST_Y(f.location::geometry) as flon,
        ST_X(f.location::geometry) as flat
      FROM delivery_requests dr
      JOIN facilities f ON f.id = dr.facility_id
      WHERE dr.status = 'looking'
    `;

    const matches = [];
    for (const req of requests) {
      let minDist = Infinity;
      const pickupLat = Number(req.pickup_lat || req.flat);
      const pickupLon = Number(req.pickup_lon || req.flon);
      const dropoffLat = Number(req.dropoff_lat);
      const dropoffLon = Number(req.dropoff_lon);

      if (!pickupLat || !pickupLon) continue;

      // Check pickup distance to route
      for (let i = 0; i < points.length - 1; i++) {
        const d = pointToSegmentDist(pickupLat, pickupLon, points[i].lat, points[i].lon, points[i+1].lat, points[i+1].lon);
        if (d < minDist) minDist = d;
      }
      // Also check dropoff
      if (dropoffLat && dropoffLon) {
        for (let i = 0; i < points.length - 1; i++) {
          const d = pointToSegmentDist(dropoffLat, dropoffLon, points[i].lat, points[i].lon, points[i+1].lat, points[i+1].lon);
          if (d < minDist) minDist = d;
        }
      }

      const deviationM = trip.deviation_km * 1000;
      if (minDist <= deviationM) {
        matches.push({ request: req, distanceToRoute: Math.round(minDist) });
      }
    }

    matches.sort((a, b) => a.distanceToRoute - b.distanceToRoute);

    return Response.json({ matches, count: matches.length });
  } catch (error) {
    console.error("Error matching:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
