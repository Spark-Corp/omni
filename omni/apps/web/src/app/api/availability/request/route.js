import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { vendorId, productId, quantity } = body;

    if (!vendorId || !productId || !quantity) {
      return Response.json(
        { error: "Missing required fields: vendorId, productId, quantity" },
        { status: 400 },
      );
    }

    // Get or create buyer user
    let buyerId;

    if (session && session.user?.email) {
      // Try to find existing user
      const existingUser = await sql`
        SELECT id FROM users WHERE phone = ${session.user.email}
      `;

      if (existingUser.length > 0) {
        buyerId = existingUser[0].id;
      } else {
        // Create new user
        const newUser = await sql`
          INSERT INTO users (phone, role, lang_preference)
          VALUES (${session.user.email}, 'buyer', 'fr')
          RETURNING id
        `;
        buyerId = newUser[0].id;
      }
    } else {
      // Create guest user
      const guestUser = await sql`
        INSERT INTO users (phone, role, lang_preference)
        VALUES (${"guest_" + Date.now()}, 'buyer', 'fr')
        RETURNING id
      `;
      buyerId = guestUser[0].id;
    }

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
      { error: "Failed to create availability request" },
      { status: 500 },
    );
  }
}
