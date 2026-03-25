import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { requestId, status, quantityConfirmed } = body;

    if (!requestId || !status) {
      return Response.json(
        { error: "requestId and status are required" },
        { status: 400 },
      );
    }

    if (!["confirmed", "denied"].includes(status)) {
      return Response.json(
        { error: "status must be 'confirmed' or 'denied'" },
        { status: 400 },
      );
    }

    const query = `
      UPDATE availability_requests
      SET status = $1, quantity_confirmed = $2, responded_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await sql(query, [status, quantityConfirmed, requestId]);

    if (result.length === 0) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    return Response.json({ request: result[0] });
  } catch (error) {
    console.error("Error responding to availability request:", error);
    return Response.json(
      { error: "Failed to respond to request" },
      { status: 500 },
    );
  }
}
