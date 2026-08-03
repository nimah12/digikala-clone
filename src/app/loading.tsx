export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-3"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}
          >
            <div className="aspect-square rounded-lg animate-pulse mb-3" style={{ background: "var(--bg)" }} />
            <div className="h-3 rounded animate-pulse mb-2" style={{ background: "var(--bg)" }} />
            <div className="h-3 rounded animate-pulse w-2/3 mb-4" style={{ background: "var(--bg)" }} />
            <div className="h-5 rounded animate-pulse w-1/2" style={{ background: "var(--bg)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
