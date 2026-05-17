import sql from "@/app/api/utils/sql";
import { authClient } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.data.user.id;
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

    // Verify vendor owns this request
    const verifyQuery = `
      SELECT ar.id 
      FROM availability_requests ar
      JOIN vendors v ON v.id = ar.vendor_id
      WHERE ar.id = $1 AND v.user_id = $2
    `;
    const verify = await sql(verifyQuery, [requestId, userId]);
    
    if (verify.length === 0) {
      return Response.json({ error: "Request not found or unauthorized" }, { status: 404 });
    }

    const query = `
      UPDATE availability_requests
      SET status = $1, quantity_confirmed = $2, responded_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await sql(query, [status, quantityConfirmed, requestId]);
    return Response.json({ request: result[0] });
  } catch (error) {
    console.error("Error responding to availability request:", error);
    return Response.json(
      { error: "Failed to respond to request" },
      { status: 500 },
    );
  }
}