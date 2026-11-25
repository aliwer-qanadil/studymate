import Diamond from "../common/Diamond.jsx";
import { t } from "../../i18n.js";

// value "" means "Any"
const places = [
  { value: "", label: t("browse.any") },
  { value: "LIBRARY", label: t("enums.LIBRARY") },
  { value: "CANTEEN", label: t("enums.CANTEEN") },
  { value: "TOP_FLOOR", label: t("enums.TOP_FLOOR") },
];

const times = [
  { value: "", label: t("browse.any") },
  { value: "MORNING", label: t("browse.MORNING") },
  { value: "AFTERNOON", label: t("browse.AFTERNOON") },
  { value: "EVENING", label: t("browse.EVENING") },
];

export default function FilterBar({ subjects, filters, setFilters, canSortMine }) {
  function change(name, value) {
    setFilters({ ...filters, [name]: value });
  }

  const subjectOptions = [{ value: "", label: t("browse.all") }];
  subjects.forEach((subject) => subjectOptions.push({ value: subject, label: subject }));

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-warm p-3.5 text-[12.5px] font-semibold">
      <FilterSelect name={t("browse.subject")} value={filters.subject} options={subjectOptions} onChange={(value) => change("subject", value)} />
      <FilterSelect name={t("browse.place")} value={filters.place} options={places} onChange={(value) => change("place", value)} />
      <FilterSelect name={t("browse.time")} value={filters.time} options={times} onChange={(value) => change("time", value)} />
      {canSortMine && (
        <button
          type="button"
          aria-pressed={filters.mineFirst}
          onClick={() => change("mineFirst", !filters.mineFirst)}
          title={t("browse.matchesFirstHint")}
          className={
            "flex items-center gap-2 rounded-full px-3.5 py-2 " +
            (filters.mineFirst ? "bg-navy text-white" : "border border-navy/10 bg-paper text-muted hover:text-navy")
          }
        >
          <Diamond />
          {t("browse.matchesFirst")}
        </button>
      )}
      <div className="flex-1"></div>
      <input
        value={filters.search}
        onChange={(e) => change("search", e.target.value)}
        placeholder={t("browse.search")}
        aria-label={t("browse.search")}
        className="w-full rounded-full sm:w-60 border border-navy/10 bg-paper px-4 py-2 font-medium outline-none placeholder:text-muted"
      />
    </div>
  );
}

function FilterSelect({ name, value, options, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-navy/10 bg-paper py-2 pr-2.5 pl-3.5">
      {name}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-muted outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
