import FieldLabel from "./FieldLabel.jsx";
import Select from "./Select.jsx";
import FieldError from "../common/FieldError.jsx";
import { t } from "../../i18n.js";

const smallestGroup = 2;
const biggestGroup = 8;

export default function WhenFields({ days, day, setDay, times, time, setTime, groupSize, setGroupSize, timeError }) {
  function makeSmaller() {
    if (groupSize > smallestGroup) setGroupSize(groupSize - 1);
  }

  function makeBigger() {
    if (groupSize < biggestGroup) setGroupSize(groupSize + 1);
  }

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <div>
        <label htmlFor="create-day">
          <FieldLabel>{t("create.day")}</FieldLabel>
        </label>
        <Select id="create-day" value={day} onChange={setDay} options={days} />
      </div>

      <div>
        <label htmlFor="create-time">
          <FieldLabel>{t("create.time")}</FieldLabel>
        </label>
        <Select id="create-time" value={time} onChange={setTime} options={times} invalid={Boolean(timeError)} describedBy="create-time-error" />
        <FieldError id="create-time-error" text={timeError} />
      </div>

      <div>
        <FieldLabel>{t("create.groupSize")}</FieldLabel>
        <div className="flex items-center justify-between rounded-xl border border-navy/10 bg-warm px-2 py-[7px]">
          <button
            type="button"
            onClick={makeSmaller}
            aria-label={t("create.smaller")}
            className="flex size-9 items-center justify-center rounded-full border border-navy/15 bg-paper font-bold"
          >
            –
          </button>
          <span className="text-[16px] font-bold">{t("create.people", { count: groupSize })}</span>
          <button
            type="button"
            onClick={makeBigger}
            aria-label={t("create.bigger")}
            className="flex size-9 items-center justify-center rounded-full bg-navy font-bold text-peach"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
