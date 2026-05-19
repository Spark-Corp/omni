import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const facilities = await sql`
      SELECT 
        f.id,
        f.name as facility_name,
        f.category,
        f.type,
        f.description,
        f.is_online,
        f.rating,
        ST_Y(f.location::geometry) as lat,
        ST_X(f.location::geometry) as lon,
        f.address,
        f.neighborhood,
        COUNT(p.id) as product_count
      FROM facilities f
      LEFT JOIN products p ON p.facility_id = f.id
      WHERE f.vendor_id = ${id}
      GROUP BY f.id, f.name, f.category, f.type, f.description, f.is_online, f.rating, f.location, f.address, f.neighborhood
      ORDER BY f.created_at ASC
    `;

    return Response.json({ facilities });
  } catch (error) {
    console.error("Error fetching vendor facilities:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
