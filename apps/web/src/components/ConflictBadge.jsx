import { AlertTriangle } from "lucide-react";

export default function ConflictBadge({ conflict, className }) {
  if (!conflict) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] text-red-400 ${className || ""}`}>
      <AlertTriangle size={10} />
      {typeof conflict === "string" ? conflict : "Conflit directionnel"}
    </span>
  );
}
