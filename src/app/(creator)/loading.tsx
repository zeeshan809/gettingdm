// Shown instantly while a creator page loads its data.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-zinc-200/70" />
        <div className="h-4 w-72 max-w-full rounded-lg bg-zinc-200/50" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-zinc-200/80 bg-white" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 rounded-2xl border border-zinc-200/80 bg-white lg:col-span-2" />
        <div className="h-72 rounded-2xl border border-zinc-200/80 bg-white" />
      </div>
    </div>
  );
}
