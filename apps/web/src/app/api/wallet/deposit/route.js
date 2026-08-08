import { getAuthenticatedUser } from "@/lib/auth";
import { requireNonProductionFeature } from "@/app/api/utils/runtime-flags";

export async function POST(request) {
  const disabled = requireNonProductionFeature("ENABLE_MOCK_FINANCIAL_FLOWS");
  if (disabled) return disabled;

  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json(
    { error: "Cette fonctionnalité est temporairement indisponible.", code: "FEATURE_DISABLED" },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
