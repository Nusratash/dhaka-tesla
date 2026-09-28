export function PoolSeatIndicator({ taken, capacity }: { taken: number; capacity: number }) {
  return (
    <div className="flex items-center gap-1" title={`${taken}/${capacity} seats taken`}>
      {Array.from({ length: capacity }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-3 w-3 rounded-full ${i < taken ? 'bg-primary' : 'bg-base-300'}`}
        />
      ))}
      <span className="ml-2 text-xs text-base-content/60">{taken}/{capacity} seats</span>
    </div>
  );
}
