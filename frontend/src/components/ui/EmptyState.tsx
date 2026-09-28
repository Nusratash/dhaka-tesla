export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
      <div className="text-4xl">🛺</div>
      <p className="font-semibold text-lg">{title}</p>
      {subtitle && <p className="text-sm text-base-content/60 max-w-sm">{subtitle}</p>}
    </div>
  );
}
