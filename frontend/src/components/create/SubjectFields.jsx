import FieldLabel from "./FieldLabel.jsx";
import Select from "./Select.jsx";
import FieldError from "../common/FieldError.jsx";
import { fromEnum } from "../../api.js";
import { t } from "../../i18n.js";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function inputClass(error) {
  return (
    "w-full rounded-xl border bg-warm px-4 py-3.5 text-[15px] font-medium outline-none placeholder:text-muted/60 focus:border-navy/40 " +
    (error ? "border-clay" : "border-navy/10")
  );
}

export default function SubjectFields({ subjects, form, change, errors }) {
  function handleSubjectChange(newSubject) {
    const found = subjects.find((s) => s.name === newSubject);
    change({ subject: newSubject, code: found.code });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <label htmlFor="create-subject">
            <FieldLabel>{t("create.subject")}</FieldLabel>
          </label>
          <Select id="create-subject" value={form.subject} onChange={handleSubjectChange} options={subjects.map((s) => s.name)} />
        </div>

        <div>
          <label htmlFor="create-code">
            <FieldLabel>{t("create.courseCode")} *</FieldLabel>
          </label>
          <input
            id="create-code"
            value={form.code}
            onChange={(e) => change({ code: e.target.value.toUpperCase() })}
            aria-invalid={errors.code ? true : undefined}
            aria-describedby="create-code-error"
            className={inputClass(errors.code)}
          />
          <FieldError id="create-code-error" text={errors.code} />
        </div>

        <div>
          <label htmlFor="create-level">
            <FieldLabel>{t("create.level")}</FieldLabel>
          </label>
          <Select
            id="create-level"
            value={form.level}
            onChange={(level) => change({ level: level })}
            options={levels.map((level) => ({ value: level, label: fromEnum(level) }))}
          />
        </div>
      </div>

      <div>
        <label htmlFor="create-title">
          <FieldLabel>{t("create.shortTitle")} *</FieldLabel>
        </label>
        <input
          id="create-title"
          value={form.title}
          onChange={(e) => change({ title: e.target.value })}
          placeholder={t("create.shortTitlePlaceholder")}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby="create-title-error"
          className={inputClass(errors.title)}
        />
        <FieldError id="create-title-error" text={errors.title} />
      </div>
    </div>
  );
}
