import { useEffect, useState } from "react";
import Label from "../common/Label.jsx";
import FieldError from "../common/FieldError.jsx";
import { fromEnum, getProfile, joinGroup, timeRange, whenText } from "../../api.js";
import { t } from "../../i18n.js";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const preferences = ["QUIET_WORK", "TALKATIVE", "MIXED_GROUP", "WOMEN_ONLY", "MEN_ONLY", "SAME_YEAR"];
const NOTE_MAX = 500;

// Answers taken from the saved profile, so the student only checks them (US-10).
// Anything the profile doesn't have stays empty and must be filled in.
function prefill(group, profile) {
  const subject = profile ? profile.subjects.find((s) => s.courseCode === group.courseCode) : null;
  const hasTime = profile && profile.availableFrom && profile.availableTo;

  return {
    courseCode: group.courseCode,
    level: subject ? subject.level : "",
    availableFrom: hasTime ? profile.availableFrom.slice(0, 5) : "",
    availableTo: hasTime ? profile.availableTo.slice(0, 5) : "",
    preferences: profile && profile.studyStyle ? [profile.studyStyle] : [],
    note: "",
  };
}

// Field errors shown under each field. Empty object = the form can be sent.
function validate(answers) {
  const errors = {};
  if (answers.courseCode.trim() === "") errors.courseCode = t("apply.errorCourse");
  else if (answers.courseCode.trim().length > 32) errors.courseCode = t("apply.errorCourseLong");
  if (answers.level === "") errors.level = t("apply.errorLevel");
  if (answers.availableFrom === "") errors.availableFrom = t("apply.errorFrom");
  if (answers.availableTo === "") errors.availableTo = t("apply.errorTo");
  else if (answers.availableFrom !== "" && answers.availableTo <= answers.availableFrom) {
    errors.availableTo = t("apply.errorOrder");
  }
  if (answers.note.length > NOTE_MAX) errors.note = t("apply.errorNote", { max: NOTE_MAX });
  return errors;
}

const inputClass = "w-full rounded-xl border bg-paper px-4 py-3 text-[14px] font-medium outline-none focus:border-navy ";

function border(error) {
  return error ? "border-clay" : "border-navy/15";
}

// The join application (US-10, US-11). onSent gets the saved request, with its score.
export default function ApplyForm({ user, group, onClose, onSent }) {
  const [answers, setAnswers] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Without a saved profile the form still opens, just empty
    getProfile(user.id)
      .then((profile) => setAnswers(prefill(group, profile)))
      .catch(() => setAnswers(prefill(group, null)));
  }, [user.id, group]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function change(name, value) {
    setAnswers({ ...answers, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  }

  function togglePreference(preference) {
    const chosen = answers.preferences.includes(preference)
      ? answers.preferences.filter((p) => p !== preference)
      : [...answers.preferences, preference];
    change("preferences", chosen);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const found = validate(answers);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    joinGroup(user.id, group.id, {
      courseCode: answers.courseCode.trim(),
      level: answers.level,
      availableFrom: answers.availableFrom,
      availableTo: answers.availableTo,
      preferences: answers.preferences,
      note: answers.note.trim() || null,
    })
      .then(onSent)
      .catch((err) => {
        // Server field errors go under their fields; the time-range rule belongs to "available to"
        const fields = { ...err.fields };
        if (fields.timeRangeValid) fields.availableTo = t("apply.errorOrder");
        delete fields.timeRangeValid;
        if (Object.keys(fields).length > 0) setErrors(fields);
        else setFormError(err.message);
      })
      .finally(() => setSending(false));
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 sm:items-center sm:px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-paper p-6 shadow-xl sm:rounded-2xl sm:p-7"
      >
        <Label className="mb-2">{t("apply.label")}</Label>
        <h2 id="apply-title" className="mb-1 text-[21px] leading-snug font-semibold">
          {group.subjectName} — {group.title}
        </h2>
        <p className="mb-5 text-[13px] font-medium text-muted">
          {fromEnum(group.place)} · {whenText(group)} · {t("apply.groupLevel", { level: fromEnum(group.level) })}
        </p>

        {answers === null ? (
          <p className="py-8 text-center text-sm font-medium text-muted">{t("common.loading")}</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4.5">
            <p className="rounded-xl bg-warm px-4 py-3 text-[12.5px] font-medium leading-relaxed text-ink">
              {t("apply.intro")}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="apply-course" className="mb-1.5 block text-[13px] font-semibold">
                  {t("apply.courseCode")} *
                </label>
                <input
                  id="apply-course"
                  autoFocus
                  value={answers.courseCode}
                  maxLength={40}
                  onChange={(e) => change("courseCode", e.target.value.toUpperCase())}
                  aria-invalid={Boolean(errors.courseCode)}
                  aria-describedby="apply-course-error"
                  className={inputClass + border(errors.courseCode)}
                />
                <FieldError id="apply-course-error" text={errors.courseCode} />
              </div>

              <div>
                <label htmlFor="apply-level" className="mb-1.5 block text-[13px] font-semibold">
                  {t("apply.level")} *
                </label>
                <select
                  id="apply-level"
                  value={answers.level}
                  onChange={(e) => change("level", e.target.value)}
                  aria-invalid={Boolean(errors.level)}
                  aria-describedby="apply-level-error"
                  className={inputClass + border(errors.level)}
                >
                  <option value="">{t("apply.pickLevel")}</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {fromEnum(level)}
                    </option>
                  ))}
                </select>
                <FieldError id="apply-level-error" text={errors.level} />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-[13px] font-semibold">
                {t("apply.freeTime")} *{" "}
                <span className="font-medium text-muted">
                  {t("apply.meetingIs", { time: timeRange(group.startTime, group.endTime) })}
                </span>
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apply-from" className="sr-only">{t("apply.from")}</label>
                  <input
                    id="apply-from"
                    type="time"
                    value={answers.availableFrom}
                    onChange={(e) => change("availableFrom", e.target.value)}
                    aria-invalid={Boolean(errors.availableFrom)}
                    aria-describedby="apply-from-error"
                    className={inputClass + border(errors.availableFrom)}
                  />
                  <FieldError id="apply-from-error" text={errors.availableFrom} />
                </div>
                <div>
                  <label htmlFor="apply-to" className="sr-only">{t("apply.to")}</label>
                  <input
                    id="apply-to"
                    type="time"
                    value={answers.availableTo}
                    onChange={(e) => change("availableTo", e.target.value)}
                    aria-invalid={Boolean(errors.availableTo)}
                    aria-describedby="apply-to-error"
                    className={inputClass + border(errors.availableTo)}
                  />
                  <FieldError id="apply-to-error" text={errors.availableTo} />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-[13px] font-semibold">
                {t("create.preferences")} <span className="font-medium text-muted">{t("create.preferencesHint")}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {preferences.map((preference) => {
                  const chosen = answers.preferences.includes(preference);
                  return (
                    <button
                      key={preference}
                      type="button"
                      aria-pressed={chosen}
                      onClick={() => togglePreference(preference)}
                      className={
                        "rounded-full px-3.5 py-2 text-[12.5px] font-semibold " +
                        (chosen ? "bg-navy text-white" : "bg-warm text-muted hover:text-navy")
                      }
                    >
                      {fromEnum(preference)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="apply-note" className="mb-1.5 block text-[13px] font-semibold">
                {t("apply.note")} <span className="font-medium text-muted">{t("apply.optional")}</span>
              </label>
              <textarea
                id="apply-note"
                rows={3}
                value={answers.note}
                onChange={(e) => change("note", e.target.value)}
                placeholder={t("apply.notePlaceholder")}
                aria-invalid={Boolean(errors.note)}
                aria-describedby="apply-note-error apply-note-count"
                className={inputClass + "resize-y " + border(errors.note)}
              />
              <div className="flex justify-between gap-3">
                <FieldError id="apply-note-error" text={errors.note} />
                <span
                  id="apply-note-count"
                  className={"mt-1.5 ml-auto text-[11.5px] font-semibold " + (answers.note.length > NOTE_MAX ? "text-clay" : "text-muted")}
                >
                  {answers.note.length} / {NOTE_MAX}
                </span>
              </div>
            </div>

            {formError && <p role="alert" className="text-[13px] font-semibold text-clay">{formError}</p>}

            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-full border border-navy/20 px-6 py-3 text-sm font-bold hover:bg-warm">
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-navy px-7 py-3 text-sm font-bold text-white hover:bg-navy-dark disabled:opacity-60"
              >
                {sending ? t("apply.sending") : t("apply.send")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
