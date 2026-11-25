import FieldLabel from "./FieldLabel.jsx";
import FieldError from "../common/FieldError.jsx";
import { t } from "../../i18n.js";

export const DESCRIPTION_MAX = 2000;

export default function DescriptionField({ description, setDescription, error }) {
  return (
    <div>
      <label htmlFor="create-description">
        <FieldLabel>{t("create.description")} *</FieldLabel>
      </label>
      <textarea
        id="create-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder={t("create.descriptionPlaceholder")}
        aria-invalid={error ? true : undefined}
        aria-describedby="create-description-error create-description-hint"
        className={
          "w-full resize-y rounded-xl border bg-warm px-4 py-3.5 text-[15px] font-medium outline-none placeholder:text-muted/60 focus:border-navy/40 " +
          (error ? "border-clay" : "border-navy/10")
        }
      />
      <FieldError id="create-description-error" text={error} />
      <span id="create-description-hint" className="mt-2 flex justify-between gap-3 text-xs font-medium text-muted">
        <span>{t("create.descriptionHint")}</span>
        <span className={description.length > DESCRIPTION_MAX ? "font-semibold text-clay" : ""}>
          {description.length} / {DESCRIPTION_MAX}
        </span>
      </span>
    </div>
  );
}
