import Label from "../common/Label.jsx";

function Row({ title, children }) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-navy/10 px-7 py-5">
      <span className="w-40 text-[15px] font-semibold">{title}</span>
      {children}
    </div>
  );
}

export default function StudyStyle({ places, favouritePlaces }) {
  return (
    <section>
      <Label className="mb-4">How I like to study</Label>

      <div className="flex flex-col gap-3">
        <Row title="Quiet vs. talkative">
          <div className="relative h-1.5 flex-1 rounded-full bg-sand">
            <div className="h-1.5 w-1/3 rounded-full bg-navy"></div>
            <span className="absolute top-1/2 left-1/3 size-4 -translate-1/2 rounded-full bg-peach"></span>
          </div>
          <span className="text-[14px] font-medium text-ink">Mostly quiet</span>
        </Row>

        <Row title="Preferred places">
          <div className="flex flex-wrap gap-2">
            {places.map((place) => (
              <span
                key={place}
                className={
                  "rounded-full px-4 py-2 text-[13px] font-semibold " +
                  (favouritePlaces.includes(place) ? "bg-navy text-white" : "bg-warm text-muted")
                }
              >
                {place}
              </span>
            ))}
          </div>
        </Row>
      </div>
    </section>
  );
}
