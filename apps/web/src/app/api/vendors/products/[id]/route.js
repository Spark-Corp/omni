import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { vendorId, name, category, price, unit, isAvailable } = body;

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

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(price);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${paramIndex++}`);
      values.push(unit);
    }
    if (isAvailable !== undefined) {
      updates.push(`is_available = $${paramIndex++}`);
      values.push(isAvailable);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    values.push(vendorId);

    const query = `
      UPDATE products
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex++} AND vendor_id = $${paramIndex}
      RETURNING id, vendor_id, name, category, price, unit, is_available, created_at
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ product: result[0], success: true });
  } catch (err) {
    console.error("PUT /api/vendors/products/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership before deleting
    const result = await sql`
      DELETE FROM products p
      USING vendors v, users u
      WHERE p.id = ${id}
        AND p.vendor_id = v.id
        AND v.user_id = u.id
        AND u.id = ${session.user.id}::uuid
      RETURNING p.id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/vendors/products/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
