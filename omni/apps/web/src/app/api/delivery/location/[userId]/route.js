import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    // Mock: return simulated live location
    // In real mode, this would return the delivery person's current_location from delivery_profiles
    const profile = await sql`
      SELECT current_location, location_updated_at
      FROM delivery_profiles WHERE user_id = ${userId}
    `;

    if (profile.length === 0 || !profile[0].current_location) {
      // Return mock location near user
      return Response.json({
        lat: 6.1319 + (Math.random() - 0.5) * 0.01,
        lon: 1.2228 + (Math.random() - 0.5) * 0.01,
        updated_at: new Date().toISOString(),
        mock: true,
      });
    }

    return Response.json({
      lat: 6.1319,
      lon: 1.2228,
      updated_at: profile[0].location_updated_at,
      mock: true,
    });
  } catch (error) {
    console.error("Error fetching delivery location:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
