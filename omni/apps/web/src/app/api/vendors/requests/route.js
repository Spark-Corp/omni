import sql from "@/app/api/utils/sql";
import { authClient } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await authClient.getSession();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all availability requests for this vendor
    const requests = await sql`
      SELECT 
        ar.id,
        ar.quantity_requested,
        ar.quantity_confirmed,
        ar.status,
        ar.created_at,
        ar.responded_at,
        p.name as product_name,
        p.unit as product_unit,
        p.price as product_price
      FROM availability_requests ar
      JOIN products p ON p.id = ar.product_id
      JOIN vendors v ON v.id = ar.vendor_id
      JOIN users u ON u.id = v.user_id
      WHERE u.id = ${session.user.id}::uuid
      ORDER BY ar.created_at DESC
      LIMIT 100
    `;

    return Response.json({ requests });
  } catch (err) {
    console.error("GET /api/vendors/requests error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
