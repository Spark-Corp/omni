import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ error: "Facility ID required" }, { status: 400 });
    }

    const reviews = await sql`
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        u.name as user_name
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.facility_id = ${id}
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    const stats = await sql`
      SELECT 
        COUNT(*) as count,
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five,
        COUNT(*) FILTER (WHERE rating = 4) as four,
        COUNT(*) FILTER (WHERE rating = 3) as three,
        COUNT(*) FILTER (WHERE rating = 2) as two,
        COUNT(*) FILTER (WHERE rating = 1) as one
      FROM reviews
      WHERE facility_id = ${id}
    `;

    return Response.json({ reviews, stats: stats[0] });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
