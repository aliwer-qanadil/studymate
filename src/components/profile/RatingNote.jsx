import Diamond from "../common/Diamond.jsx";

export default function RatingNote() {
  return (
    <div className="flex items-start gap-3">
      <Diamond className="mt-1.5" />
      <p className="text-[13px] font-medium leading-relaxed text-muted">
        Ratings are given anonymously by members you actually studied with, and only after a session ends.
      </p>
    </div>
  );
}
