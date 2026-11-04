import Label from "../common/Label.jsx";
import Diamond from "../common/Diamond.jsx";

export default function RecentSessions({ sessions }) {
  return (
    <section>
      <Label className="mb-2">Recent sessions</Label>

      {sessions.map((session) => (
        <div key={session.title} className="flex items-center gap-4 border-b border-navy/10 py-5 last:border-b-0">
          <Diamond className="size-2.5" />
          <span className="flex-1 text-[16px] font-semibold">{session.title}</span>
          <span className="text-[14px] font-medium text-muted">{session.where}</span>
          <span
            className={"w-24 text-right text-[14px] font-semibold " + (session.taught ? "text-peach-dark" : "text-ink")}
          >
            {session.taught ? "You taught" : "Attended"}
          </span>
        </div>
      ))}
    </section>
  );
}
