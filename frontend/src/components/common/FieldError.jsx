// A red message under a form field. Renders nothing when there is no error.
export default function FieldError({ id, text }) {
  if (!text) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[12.5px] font-semibold text-clay">
      {text}
    </p>
  );
}
