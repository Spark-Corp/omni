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

    const query = `
      SELECT 
        f.id,
        f.name as facility_name,
        f.category,
        f.description,
        f.type,
        f.is_online,
        f.rating,
        ST_Y(f.location::geometry) as lat,
        ST_X(f.location::geometry) as lon,
        ST_Distance(f.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance,
        v.id as vendor_id,
        v.name as vendor_name,
        COUNT(p.id) as product_count,
        COALESCE(AVG(p.price), 0) as avg_price,
        (SELECT COUNT(*) FROM reviews r WHERE r.facility_id = f.id) as review_count
      FROM facilities f
      JOIN vendors v ON v.id = f.vendor_id
      LEFT JOIN products p ON p.facility_id = f.id
      WHERE f.is_online = true
        AND ST_DWithin(f.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
      GROUP BY f.id, f.name, f.category, f.description, f.type, f.is_online, f.rating, f.location, v.id, v.name
      ORDER BY distance
      LIMIT 50
    `;

    const facilities = await sql(query, [lon, lat, radius]);

    return Response.json({ facilities });
  } catch (error) {
    console.error("Error fetching nearby facilities:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
