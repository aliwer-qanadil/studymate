import Label from "../common/Label.jsx";

export default function SubjectList({ subjects }) {
  return (
    <section>
      <Label className="mb-4">Subjects I study</Label>

      <div className="flex flex-wrap gap-2.5">
        {subjects.map((subject, index) => (
          <span
            key={subject}
            className={
              "rounded-full px-5 py-2.5 text-[14px] font-semibold " +
              (index === 0 ? "bg-navy text-white" : "border border-navy/10 bg-warm text-ink")
            }
          >
            {subject}
          </span>
        ))}

        <span className="rounded-full border border-dashed border-peach-dark/50 px-5 py-2.5 text-[14px] font-semibold text-peach-dark">
          + Add subject
        </span>
      </div>
    </section>
  );
}
