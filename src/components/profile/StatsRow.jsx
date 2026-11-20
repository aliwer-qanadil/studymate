export default function StatsRow({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl bg-warm px-7 py-6">
          <div className="text-[32px] font-bold">{stat.number}</div>
          <div className="text-[14px] font-medium text-ink">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}
