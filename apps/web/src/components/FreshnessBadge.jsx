export default function FreshnessBadge({ lastConfirmedAt, className = "" }) {
  if (!lastConfirmedAt) return null;

  const hours = (Date.now() - new Date(lastConfirmedAt).getTime()) / (1000 * 60 * 60);

  if (hours < 48) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Disponible
      </span>
    );
  }

  if (hours < 168) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        À vérifier
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Ancien
    </span>
  );
}
