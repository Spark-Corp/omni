import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lon, radius = 10000 } = body;

    if (!lat || !lon) {
      return Response.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    // Get all online vendors within radius with their product count
    const query = `
      SELECT 
        v.id,
        v.name,
        v.category,
        v.description,
        ST_Y(v.location::geometry) as lat,
        ST_X(v.location::geometry) as lon,
        ST_Distance(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance,
        COUNT(p.id) as product_count
      FROM vendors v
      LEFT JOIN products p ON p.vendor_id = v.id AND p.is_available = true
      WHERE v.is_online = true
        AND ST_DWithin(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
      GROUP BY v.id, v.name, v.category, v.description, v.location
      ORDER BY distance
      LIMIT 50
    `;

    const vendors = await sql(query, [lon, lat, radius]);

    return Response.json({ vendors });
  } catch (error) {
    console.error("Error fetching nearby vendors:", error);
    return Response.json(
      { error: "Failed to fetch nearby vendors" },
      { status: 500 },
    );
  }
}
