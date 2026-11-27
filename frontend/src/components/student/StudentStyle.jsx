import Label from "../common/Label.jsx";
import { fromEnum } from "../../api.js";
import { t } from "../../i18n.js";

function Row({ title, values }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy/10 px-5 py-5 sm:gap-6 sm:px-7">
      <span className="w-full text-[15px] font-semibold sm:w-40">{title}</span>
      <div className="flex flex-wrap gap-2">
        {values.length === 0 && <span className="text-[13px] font-medium text-muted">{t("student.notSet")}</span>}
        {values.map((value) => (
          <span key={value} className="rounded-full bg-warm px-4 py-2 text-[13px] font-semibold text-ink">
            {fromEnum(value)}
          </span>
        ))}
      </div>
    </div>
  );
}

// Read-only study style and favourite places
export default function StudentStyle({ studyStyle, places }) {
  return (
    <section>
      <Label className="mb-4">{t("student.studyStyle")}</Label>
      <div className="flex flex-col gap-3">
        <Row title={t("profile.quietOrTalkative")} values={studyStyle ? [studyStyle] : []} />
        <Row title={t("profile.places")} values={places} />
      </div>
    </section>
  );
}
