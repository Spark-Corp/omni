import sql from "@/app/api/utils/sql";

export async function POST(request) {
  console.log('[API] DATABASE_URL present?', !!process.env.DATABASE_URL);
  console.log('[API] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
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
      LEFT JOIN products p ON p.vendor_id = v.id
      WHERE v.is_online = true
        AND ST_DWithin(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
      GROUP BY v.id, v.name, v.category, v.description, v.location
      ORDER BY distance
      LIMIT 50
    `;

    const vendors = await sql(query, [lon, lat, radius]);

    return Response.json({ vendors });
  } catch (error) {
    console.error("Error fetching nearby vendors:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    return Response.json(
      { error: "Internal server error" }
      { status: 500 },
    );
  }
}
