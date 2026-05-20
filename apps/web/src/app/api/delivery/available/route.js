import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get delivery profile with active mode and radius
    const profiles = await sql`
      SELECT id, is_active, active_mode, active_radius_km,
        (SELECT delivery_tier FROM users WHERE id = ${userId}) as tier
      FROM delivery_profiles WHERE user_id = ${userId}
    `;
    if (profiles.length === 0 || !profiles[0].is_active) {
      return Response.json({ available: [] });
    }

    const p = profiles[0];

    // Mock: return simulated available delivery requests
    // In real mode, this would query delivery_requests in radius
    const mockRequests = [
      {
        id: "mock-1",
        facility_name: "Boutique A",
        pickup_address: "Marché central, Lomé",
        dropoff_address: "Quartier administratif, Lomé",
        distance_km: 2.3,
        delivery_fee: 500,
        estimated_duration_min: 15,
      },
      {
        id: "mock-2",
        facility_name: "Pâtisserie B",
        pickup_address: "Rue des Artisans, Lomé",
        dropoff_address: "Résidence Cocotiers, Lomé",
        distance_km: 4.1,
        delivery_fee: 800,
        estimated_duration_min: 25,
      },
      {
        id: "mock-3",
        facility_name: "Pharmacie C",
        pickup_address: "Avenue de la Paix, Lomé",
        dropoff_address: "Clinique Espoir, Lomé",
        distance_km: 1.8,
        delivery_fee: 600,
        estimated_duration_min: 12,
      },
    ];

    return Response.json({
      available: mockRequests,
      mode: p.active_mode,
      radius_km: p.active_radius_km,
    });
  } catch (error) {
    console.error("Error fetching available deliveries:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
