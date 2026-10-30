import { Link } from "react-router-dom";
import Label from "../common/Label.jsx";
import DarkModeToggle from "./DarkModeToggle.jsx";

export default function Settings({ loggedIn, onLogout }) {
  return (
    <section>
      <Label className="mb-4">Settings</Label>

      <div className="flex flex-col rounded-2xl border border-navy/10">
        <div className="flex items-center justify-between gap-6 border-b border-navy/10 px-7 py-5">
          <div>
            <div className="text-[15px] font-semibold">Dark mode</div>
            <div className="text-[13px] font-medium text-muted">Easier on the eyes for late-night studying.</div>
          </div>
          <DarkModeToggle />
        </div>

        <div className="flex items-center justify-between gap-6 px-7 py-5">
          <div>
            <div className="text-[15px] font-semibold">{loggedIn ? "Log out" : "You're a guest"}</div>
            <div className="text-[13px] font-medium text-muted">
              {loggedIn ? "You'll need a new code from your SDU email to log back in." : "Log in to get your own profile."}
            </div>
          </div>

          {loggedIn ? (
            <button
              onClick={onLogout}
              className="rounded-full border border-clay/40 px-5 py-2.5 text-[13px] font-bold text-clay hover:bg-clay/10"
            >
              Log out
            </button>
          ) : (
            <Link to="/" className="rounded-full bg-navy px-5 py-2.5 text-[13px] font-bold text-white hover:bg-navy-dark">
              Log in
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
