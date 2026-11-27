import Label from "../common/Label.jsx";
import StudentLink from "../common/StudentLink.jsx";
import { initialsOf } from "../../api.js";
import { t } from "../../i18n.js";

// Students the organizer declined or removed. A decline can be taken back while there are free seats.
export default function DeclinedList({ declined, canAccept, onAccept }) {
  if (declined.length === 0) return null;

  return (
    <section className="mt-8">
      <Label className="mb-4">{t("applicants.declined", { count: declined.length })}</Label>

      <div className="flex flex-col gap-2.5">
        {declined.map((request) => (
          <div key={request.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy/10 px-5 py-3.5">
            <div className="flex size-10 items-center justify-center rounded-full border border-navy/15 bg-paper text-[13px] font-bold text-muted">
              {initialsOf(request.applicant.name)}
            </div>
            <StudentLink student={request.applicant} className="text-[15px] font-semibold text-muted" />
            <span className="ml-auto text-xs font-bold text-muted">{t("common.matchTag", { score: request.score })}</span>
            <button
              onClick={() => onAccept(request)}
              disabled={!canAccept}
              className="rounded-full border border-navy/20 px-4 py-2 text-[12.5px] font-bold hover:bg-warm disabled:opacity-40"
            >
              {t("applicants.acceptAgain")}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
