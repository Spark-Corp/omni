import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get("lat"));
    const lon = parseFloat(url.searchParams.get("lon"));
    const radiusMeters = parseInt(url.searchParams.get("radius")) || 500;

    if (!userId || !lat || !lon) {
      return Response.json({ error: "x-user-id, lat, and lon required" }, { status: 400 });
    }

    // Mock: return simulated nearby entities
    // In real mode, this would query facilities and delivery_profiles within radius
    const mockNearby = [
      {
        type: "facility",
        id: "mock-f1",
        name: "Marché des Arts",
        category: "Artisanat",
        distance_meters: 120,
        lat: lat + 0.001,
        lon: lon + 0.002,
      },
      {
        type: "vendor",
        id: "mock-v1",
        name: "Restaurant Chez Ama",
        category: "Alimentation",
        distance_meters: 300,
        lat: lat - 0.002,
        lon: lon + 0.001,
      },
      {
        type: "delivery_person",
        id: "mock-d1",
        name: "Kofi",
        distance_meters: 450,
        lat: lat + 0.003,
        lon: lon - 0.001,
      },
    ];

    return Response.json({ nearby: mockNearby, radius_meters: radiusMeters });
  } catch (error) {
    console.error("Error fetching nearby entities:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
