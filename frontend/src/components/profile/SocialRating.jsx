import Label from "../common/Label.jsx";

export default function SocialRating({ overall, sessions, ratings }) {
  return (
    <div className="rounded-3xl bg-navy p-7 text-white">
      <div className="mb-6 flex items-center justify-between">
        <Label onDark>Social rating</Label>
        <span className="text-[12px] font-medium text-white/60">from {sessions} sessions</span>
      </div>

      <div className="mb-7 flex items-center gap-6">
        <div className="ml-2 flex size-17 shrink-0 rotate-45 items-center justify-center rounded-[14px] bg-peach">
          <span className="-rotate-45 text-[22px] font-bold text-navy">{overall}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-white/80">A measure of how you show up — never of what you know.</p>
      </div>

      <div className="flex flex-col gap-5">
        {ratings.map((rating) => (
          <div key={rating.label}>
            <div className="mb-2 flex justify-between text-[14px] font-semibold">
              <span>{rating.label}</span>
              <span>{rating.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-peach" style={{ width: (rating.score / 5) * 100 + "%" }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
