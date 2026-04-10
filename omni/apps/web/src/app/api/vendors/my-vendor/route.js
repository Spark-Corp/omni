import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authUserId = session.user.id;

    // Get or create user in users table
    let userResult = await sql`
      SELECT id FROM users WHERE id = ${authUserId}::uuid
    `;

    if (userResult.length === 0) {
      // No user in users table yet, so no vendor exists
      return Response.json({ vendor: null });
    }

    const userId = userResult[0].id;

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
      SELECT id, name, category, price, unit, is_available, photo_url
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
