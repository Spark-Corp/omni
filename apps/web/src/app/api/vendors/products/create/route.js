import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vendorId, name, category, price, unit } = body;

    if (!vendorId || !name || !price) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify vendor ownership
    const vendorCheck = await sql`
      SELECT v.id 
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      WHERE v.id = ${vendorId} AND u.id = ${session.user.id}::uuid
    `;

    if (vendorCheck.length === 0) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    const result = await sql`
      INSERT INTO products (vendor_id, name, category, price, unit, is_available)
      VALUES (
        ${vendorId},
        ${name},
        ${category || "Général"},
        ${price},
        ${unit || "unité"},
        true
      )
      RETURNING id, vendor_id, name, category, price, unit, is_available, created_at
    `;

    return Response.json({ product: result[0], success: true });
  } catch (err) {
    console.error("POST /api/vendors/products/create error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
