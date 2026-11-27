import ScoreDiamond from "./ScoreDiamond.jsx";
import StudentLink from "../common/StudentLink.jsx";
import ScoreBreakdown from "./ScoreBreakdown.jsx";
import { fromEnum, initialsOf, timeRange } from "../../api.js";
import { t } from "../../i18n.js";

function hintFor(applicant) {
  if (applicant.breakdown.level < 60) return t("applicants.hintLevel");
  if (applicant.breakdown.time < 100) return t("applicants.hintTime");
  return "";
}

export default function ApplicantCard({ applicant, canAccept, onAccept, onDecline }) {
  const strong = applicant.score >= 85;

  return (
    <article className="grid items-center gap-6 rounded-[22px] border border-navy/10 bg-paper px-5 py-6 sm:grid-cols-[140px_1fr] sm:px-8 sm:py-7 xl:grid-cols-[140px_1fr_320px_220px] xl:gap-8 shadow-[0_2px_10px_rgba(38,42,84,0.05)]">
      <ScoreDiamond score={applicant.score} />

      <div>
        <div className="flex items-center gap-3">
          <div
            className={
              "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold " +
              (strong ? "bg-navy text-white" : "border border-navy/15 bg-warm")
            }
          >
            {initialsOf(applicant.applicant.name)}
          </div>
          <div>
            <StudentLink student={applicant.applicant} className="block text-[19px] font-semibold" />
            <div className="text-[13.5px] font-medium text-muted">
              {t("applicants.levelFree", {
                level: fromEnum(applicant.level),
                time: timeRange(applicant.availableFrom, applicant.availableTo),
              })}
            </div>
          </div>
        </div>

        {applicant.note && (
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed font-medium text-ink">“{applicant.note}”</p>
        )}

        {applicant.preferences.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {applicant.preferences.map((preference) => (
              <span key={preference} className="rounded-full bg-warm px-3.5 py-1.5 text-[12.5px] font-semibold text-ink">
                {fromEnum(preference)}
              </span>
            ))}
          </div>
        )}
      </div>

      <ScoreBreakdown breakdown={applicant.breakdown} hint={hintFor(applicant)} />

      <div className="flex gap-3 sm:col-span-2 xl:col-span-1 xl:flex-col">
        <button
          onClick={onAccept}
          disabled={!canAccept}
          className="flex-1 rounded-full bg-navy py-4 text-sm font-bold text-white hover:bg-navy-dark disabled:opacity-40"
        >
          {t("common.accept")}
        </button>
        <button onClick={onDecline} className="flex-1 rounded-full border border-navy/15 py-4 text-sm font-semibold hover:bg-warm">
          {t("common.decline")}
        </button>
      </div>
    </article>
  );
}
