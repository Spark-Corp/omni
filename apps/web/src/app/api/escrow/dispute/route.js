import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { cartId } = body;
    if (!cartId) {
      return Response.json({ error: "cartId required" }, { status: 400 });
    }

    const escrow = await sql`
      UPDATE escrow_holds SET status = 'disputed', updated_at = CURRENT_TIMESTAMP
      WHERE cart_id = ${cartId} AND status IN ('held', 'delivery_confirmed', 'buyer_confirmed')
      RETURNING *
    `;

    if (escrow.length === 0) {
      return Response.json({ error: "No active escrow for this cart" }, { status: 404 });
    }

    return Response.json({ escrow: escrow[0], message: "Litige ouvert. Les fonds sont bloqués en attendant la résolution." });
  } catch (error) {
    console.error("Error opening dispute:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
