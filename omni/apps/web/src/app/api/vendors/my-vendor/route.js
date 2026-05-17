import sql from "@/app/api/utils/sql";
import { authClient } from "@/lib/auth";

export async function GET(request) {
  try {
    let userId;
    
    // Try header first (from client)
    const headerUserId = request.headers.get("x-user-id");
    
    if (headerUserId) {
      userId = headerUserId;
    } else {
      // Fallback to session (server-side)
      const session = await authClient.getSession();
      if (!session?.data?.user?.id) {
        return Response.json({ vendor: null });
      }
      userId = session.data.user.id;
    }

    // Get user from users table
    const userResult = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

    if (userResult.length === 0) {
      return Response.json({ vendor: null });
    }

    // Get vendor for this user
    const vendorResult = await sql`
      SELECT 
        id,
        name,
        category,
        description,
        is_online,
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lon,
        created_at
      FROM vendors
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (vendorResult.length === 0) {
      return Response.json({ vendor: null });
    }

    const vendor = vendorResult[0];

    // Get products for this vendor
    const productsResult = await sql`
      SELECT id, name, price, unit, is_available, image_url
      FROM products
      WHERE vendor_id = ${vendor.id}
      ORDER BY created_at DESC
    `;

    vendor.products = productsResult;

    return Response.json({ vendor });
  } catch (err) {
    console.error("GET /api/vendors/my-vendor error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}