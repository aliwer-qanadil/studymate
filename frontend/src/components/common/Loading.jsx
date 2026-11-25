import { t } from "../../i18n.js";

// Shown while a page waits for the server, so an empty page isn't mistaken for missing data
export default function Loading({ className = "" }) {
  return (
    <p role="status" aria-live="polite" className={"flex items-center gap-3 py-6 text-sm font-medium text-muted " + className}>
      <span className="size-4 animate-spin rounded-full border-2 border-navy/15 border-t-peach-dark motion-reduce:animate-none" aria-hidden="true"></span>
      {t("common.loading")}
    </p>
  );
}
