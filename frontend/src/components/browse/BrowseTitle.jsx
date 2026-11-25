import Label from "../common/Label.jsx";
import { t } from "../../i18n.js";

const ranges = ["all", "today", "week"];

// range: "all" upcoming groups, only "today", or the next 7 days ("week")
export default function BrowseTitle({ count, range, setRange }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Label className="mb-2">{t("browse.label")}</Label>
        <h2 className="text-[24px] font-semibold sm:text-[26px]">{t("browse.title", { count: count })}</h2>
      </div>
      <div className="flex gap-2 text-xs" role="group" aria-label={t("browse.when")}>
        {ranges.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={range === value}
            onClick={() => setRange(value)}
            className={
              range === value
                ? "rounded-full bg-navy px-3.5 py-2 font-bold text-white"
                : "rounded-full border border-navy/15 px-3.5 py-2 font-semibold text-ink hover:border-navy/40"
            }
          >
            {t("browse.range_" + value)}
          </button>
        ))}
      </div>
    </div>
  );
}
