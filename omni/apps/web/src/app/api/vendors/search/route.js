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

    // Query vendors with products matching search within radius
    // Using PostGIS ST_DWithin for distance filtering and ST_Distance for sorting
    const query = `
      SELECT DISTINCT ON (v.id)
        v.id,
        v.name,
        v.category,
        v.description,
        ST_Y(v.location::geometry) as lat,
        ST_X(v.location::geometry) as lon,
        ST_Distance(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance,
        json_agg(json_build_object(
          'id', p.id,
          'name', p.name,
          'price', p.price,
          'unit', p.unit,
          'photo_url', p.photo_url
        )) as products
      FROM vendors v
      JOIN products p ON p.vendor_id = v.id
      WHERE v.is_online = true
        AND p.is_available = true
        AND ST_DWithin(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
        ${search ? "AND p.name ILIKE $4" : ""}
      GROUP BY v.id, v.name, v.category, v.description, v.location
      ORDER BY v.id, distance
      LIMIT 3
    `;

    const params = search
      ? [lon, lat, radius, `%${search}%`]
      : [lon, lat, radius];

    const vendors = await sql(query, params);

    return Response.json({ vendors });
  } catch (error) {
    console.error("Error searching vendors:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
