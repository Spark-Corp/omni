import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const users = await sql`
      SELECT vendor_tier, delivery_tier FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) return Response.json({ vendorTier: "free", deliveryTier: "free" });

    return Response.json({
      vendorTier: users[0].vendor_tier || "free",
      deliveryTier: users[0].delivery_tier || "free",
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
