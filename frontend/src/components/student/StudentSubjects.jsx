import Label from "../common/Label.jsx";
import { fromEnum } from "../../api.js";
import { t } from "../../i18n.js";

// Read-only list of the subjects someone studies, with their level
export default function StudentSubjects({ subjects }) {
  return (
    <section>
      <Label className="mb-4">{t("student.subjects")}</Label>

      {subjects.length === 0 && <p className="text-[14px] font-medium text-muted">{t("student.noSubjects")}</p>}

      <div className="flex flex-wrap items-center gap-2.5">
        {subjects.map((subject) => (
          <span
            key={subject.courseCode}
            className="flex items-center gap-2 rounded-full border border-navy/10 bg-warm px-5 py-2.5 text-[14px] font-semibold text-ink"
          >
            {subject.subjectName}
            <span className="font-medium opacity-60">
              {subject.courseCode} · {fromEnum(subject.level)}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
