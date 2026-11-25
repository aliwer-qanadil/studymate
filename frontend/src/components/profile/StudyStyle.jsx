import { useState } from "react";
import Label from "../common/Label.jsx";
import { fromEnum } from "../../api.js";
import { t } from "../../i18n.js";

const styles = ["QUIET_WORK", "MIXED_GROUP", "TALKATIVE"];
const allPlaces = ["LIBRARY", "CANTEEN", "TOP_FLOOR"];

function Row({ title, children }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy/10 px-5 py-5 sm:gap-6 sm:px-7">
      <span className="w-full text-[15px] font-semibold sm:w-40">{title}</span>
      {children}
    </div>
  );
}

function Chip({ chosen, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onClick}
      className={
        "rounded-full px-4 py-2 text-[13px] font-semibold " +
        (chosen ? "bg-navy text-white" : "bg-warm text-muted hover:text-navy")
      }
    >
      {children}
    </button>
  );
}

// "14:00:00" -> "14:00", null -> ""
function hhmm(time) {
  return time ? time.slice(0, 5) : "";
}

// The time of day the student is usually free. It prefills the join application form.
function FreeTime({ availableFrom, availableTo, onSave }) {
  const [from, setFrom] = useState(hhmm(availableFrom));
  const [to, setTo] = useState(hhmm(availableTo));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const changed = from !== hhmm(availableFrom) || to !== hhmm(availableTo);

  function save(e) {
    e.preventDefault();
    setSaved(false);
    if ((from === "") !== (to === "")) {
      setError(t("profile.freeTimeBoth"));
      return;
    }
    if (from !== "" && to <= from) {
      setError(t("apply.errorOrder"));
      return;
    }
    setError("");
    onSave({ availableFrom: from || null, availableTo: to || null })
      .then(() => setSaved(true))
      .catch((err) => setError(err.message));
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="free-from">{t("apply.from")}</label>
      <input
        id="free-from"
        type="time"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="rounded-xl border border-navy/15 bg-paper px-3 py-2 text-[13px] font-semibold outline-none focus:border-navy"
      />
      <span className="text-muted">–</span>
      <label className="sr-only" htmlFor="free-to">{t("apply.to")}</label>
      <input
        id="free-to"
        type="time"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="rounded-xl border border-navy/15 bg-paper px-3 py-2 text-[13px] font-semibold outline-none focus:border-navy"
      />
      <button
        type="submit"
        disabled={!changed}
        className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-bold text-white hover:bg-navy-dark disabled:opacity-40"
      >
        {t("common.save")}
      </button>
      {saved && !changed && <span role="status" className="text-[12.5px] font-semibold text-sage">{t("profile.saved")}</span>}
      {error && <span role="alert" className="w-full text-[12.5px] font-semibold text-clay">{error}</span>}
    </form>
  );
}

// onSave gets only what changed, e.g. { studyStyle: "TALKATIVE" }
export default function StudyStyle({ studyStyle, places, availableFrom, availableTo, onSave, onSaveTime }) {
  // Clicking the chosen style again clears it
  function pickStyle(style) {
    onSave({ studyStyle: style === studyStyle ? null : style });
  }

  function togglePlace(place) {
    if (places.includes(place)) {
      onSave({ favouritePlaces: places.filter((p) => p !== place) });
    } else {
      onSave({ favouritePlaces: [...places, place] });
    }
  }

  return (
    <section>
      <Label className="mb-1">{t("profile.studyStyle")}</Label>
      <p className="mb-4 text-[13px] font-medium text-muted">{t("profile.clickToChange")}</p>

      <div className="flex flex-col gap-3">
        <Row title={t("profile.quietOrTalkative")}>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <Chip key={style} chosen={style === studyStyle} onClick={() => pickStyle(style)}>
                {fromEnum(style)}
              </Chip>
            ))}
          </div>
        </Row>

        <Row title={t("profile.places")}>
          <div className="flex flex-wrap gap-2">
            {allPlaces.map((place) => (
              <Chip key={place} chosen={places.includes(place)} onClick={() => togglePlace(place)}>
                {fromEnum(place)}
              </Chip>
            ))}
          </div>
        </Row>

        <Row title={t("profile.freeTime")}>
          <FreeTime availableFrom={availableFrom} availableTo={availableTo} onSave={onSaveTime} />
        </Row>
      </div>
      <p className="mt-3 text-[12.5px] font-medium text-muted">{t("profile.freeTimeHint")}</p>
    </section>
  );
}
