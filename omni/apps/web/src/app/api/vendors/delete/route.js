import sql from "@/app/api/utils/sql";

export async function DELETE(request) {
  try {
    let userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendorId = request.headers.get("x-vendor-id");
    if (!vendorId) {
      return Response.json({ error: "x-vendor-id header required" }, { status: 400 });
    }

    // Products cascade-delete via FK
    const result = await sql`
      DELETE FROM vendors WHERE id = ${vendorId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Vendor not found or unauthorized" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/vendors/delete error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
