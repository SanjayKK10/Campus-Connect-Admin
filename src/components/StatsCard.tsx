interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="glass-card flex items-center gap-4 p-5 transition hover:border-violet-200/70"
      style={{ ['--hover-bg' as string]: 'transparent' }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9c7cff] to-[#dec8ff] text-xl shadow-lg shadow-violet-400/20">
        {icon}
      </div>
      <div>
        <p className="text-sm" style={{ color: 'var(--color-cc-muted)' }}>{label}</p>
        <p className="text-3xl font-bold" style={{ color: 'var(--color-cc-text)' }}>{value}</p>
      </div>
    </div>
  );
}