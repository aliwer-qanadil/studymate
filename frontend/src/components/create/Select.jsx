// options: plain strings, or { value, label } when the shown text differs from the value
export default function Select({ id, value, onChange, options, invalid, describedBy }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={
          "w-full appearance-none rounded-xl border bg-warm px-4 py-3.5 text-[15px] font-medium outline-none focus:border-navy/40 " +
          (invalid ? "border-clay" : "border-navy/10")
        }
      >
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-peach-dark">▼</span>
    </div>
  );
}
