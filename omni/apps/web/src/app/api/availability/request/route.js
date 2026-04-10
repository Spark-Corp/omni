import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { vendorId, productId, quantity } = body;

    if (!vendorId || !productId || !quantity) {
      return Response.json(
        { error: "Missing required fields: vendorId, productId, quantity" },
        { status: 400 },
      );
    }

    // Create guest user for now
    const guestUser = await sql`
      INSERT INTO users (phone, role, lang_preference)
      VALUES (${"guest_" + Date.now()}, 'buyer', 'fr')
      RETURNING id
    `;
    const buyerId = guestUser[0].id;

    // Create availability request
    const result = await sql`
      INSERT INTO availability_requests (buyer_id, vendor_id, product_id, quantity_requested, status)
      VALUES (${buyerId}, ${vendorId}, ${productId}, ${quantity}, 'pending')
      RETURNING id, buyer_id, vendor_id, product_id, quantity_requested, status, created_at
    `;

    return Response.json({ request: result[0], success: true });
  } catch (error) {
    console.error("Error creating availability request:", error);
    return Response.json(
      { error: "Internal server error",  },
      { status: 500 },
    );
  }
}
