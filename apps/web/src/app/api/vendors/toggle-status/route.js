import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vendorId, isOnline } = body;

    if (!vendorId || typeof isOnline !== "boolean") {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    // Update vendor status (only if owned by this user)
    const result = await sql`
      UPDATE vendors
      SET is_online = ${isOnline}, last_seen = NOW()
      WHERE id = ${vendorId} AND user_id = ${userId}
      RETURNING id, is_online, last_seen
    `;

    if (result.length === 0) {
      return Response.json(
        { error: "Vendor not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json({ vendor: result[0], success: true });
  } catch (err) {
    console.error("POST /api/vendors/toggle-status error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
