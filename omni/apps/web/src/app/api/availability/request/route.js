import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vendorId, productId, quantity } = body;

    if (!vendorId || !productId || !quantity) {
      return Response.json(
        { error: "Missing required fields: vendorId, productId, quantity" },
        { status: 400 },
      );
    }

    const buyerId = userId;

    // Verify vendor exists
    const vendorCheck = await sql`
      SELECT id FROM vendors WHERE id = ${vendorId}
    `;
    
    if (vendorCheck.length === 0) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Create availability request
    const result = await sql`
      INSERT INTO availability_requests (buyer_id, vendor_id, product_id, quantity_requested, status)
      VALUES (${buyerId}, ${vendorId}, ${productId}, ${quantity}, 'pending')
      RETURNING id, buyer_id, vendor_id, product_id, quantity_requested, status, created_at
    `;

    // Create notification for vendor
    const vendor = await sql`
      SELECT v.user_id FROM vendors v WHERE v.id = ${vendorId}
    `;

    if (vendor.length > 0) {
      await sql`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
          ${vendor[0].user_id},
          'request',
          'Nouvelle demande',
          ${`Quelqu'un demande: ${quantity} articles`},
          '/vendor/requests'
        )
      `;
    }

    return Response.json({ request: result[0], success: true });
  } catch (error) {
    console.error("Error creating availability request:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}