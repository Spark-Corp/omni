import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lon, search, radius = 5000 } = body;

    if (!lat || !lon) {
      return Response.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    const searchTerm = search ? `%${search}%` : "";

    const query = `
      SELECT
        v.id,
        v.name,
        v.category,
        v.description,
        ST_Y(v.location::geometry) as lat,
        ST_X(v.location::geometry) as lon,
        ST_Distance(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance,
        COALESCE(json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'price', p.price,
            'unit', p.unit,
            'photo_url', p.image_url
          )
          ORDER BY p.name
        ) FILTER (WHERE p.id IS NOT NULL), '[]'::json) as products
      FROM vendors v
      LEFT JOIN products p ON p.vendor_id = v.id
      WHERE v.is_online = true
        AND ST_DWithin(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
        ${search ? `AND (p.name ILIKE $4 OR v.name ILIKE $4 OR v.category ILIKE $4 OR v.description ILIKE $4)` : ""}
      GROUP BY v.id, v.name, v.category, v.description, v.location
      ORDER BY distance
      LIMIT 10
    `;

    const params = search
      ? [lon, lat, radius, searchTerm]
      : [lon, lat, radius];

    console.log("[Search] query params:", params);
    const vendors = await sql(query, params);
    console.log("[Search] results:", vendors?.length);

    return Response.json({ vendors });
  } catch (error) {
    console.error("[Search] Error:", error?.message);
    console.error("[Search] Stack:", error?.stack);
    return Response.json(
      { error: "Internal server error", message: error?.message, stack: error?.stack },
      { status: 500 },
    );
  }
}
