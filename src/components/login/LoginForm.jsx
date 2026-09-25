import { useState } from "react";
import { useNavigate } from "react-router-dom";
import crest from "../../assets/sdu-crest.png";
import Label from "../Label.jsx";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault(); 
    navigate("/browse");
  }

  return (
    <div className="flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-7">
        {/* Small logo, only on small screens where the navy half is hidden */}
        <div className="flex items-center gap-3 lg:hidden">
          <img src={crest} alt="SDU University" className="h-8" />
          <span className="font-serif text-xl font-medium">Study Mate</span>
        </div>

        <div>
          <Label className="mb-3">Student access</Label>
          <h1 className="mb-2 text-[28px] font-semibold">Welcome back</h1>
          <p className="text-sm font-medium text-muted">
            Log in with the university account you got when you enrolled at SDU.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label>
            <span className="mb-2 block text-xs font-semibold text-ink">SDU email</span>
            <div className="flex items-center rounded-xl border border-navy/10 bg-warm px-4 focus-within:border-navy/40">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name.surname"
                className="w-full bg-transparent py-3.5 text-[15px] font-medium outline-none placeholder:text-muted/60"
              />
              <span className="text-[15px] font-medium text-muted">@sdu.edu.kz</span>
            </div>
          </label>

          <label>
            <span className="mb-2 block text-xs font-semibold text-ink">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-warm px-4 py-3.5 text-[15px] font-medium outline-none focus:border-navy/40"
            />
          </label>

          <div className="flex items-center justify-between text-xs font-semibold">
            {/* type="button" so clicking it doesn't submit the form */}
            <button type="button" onClick={() => setKeepSignedIn(!keepSignedIn)} className="flex items-center gap-2 text-ink">
              <span
                className={
                  "flex size-4 items-center justify-center rounded-[5px] text-[10px] text-peach " +
                  (keepSignedIn ? "bg-navy" : "border border-navy/30")
                }
              >
                {keepSignedIn ? "✓" : ""}
              </span>
              Keep me signed in
            </button>
            <a href="#" className="text-peach-dark hover:underline">Forgot password?</a>
          </div>
        </div>

        <button type="submit" className="rounded-full bg-navy p-4 text-sm font-bold text-white hover:bg-navy-dark">
          Log in with SDU account
        </button>

        <p className="text-[11.5px] font-medium leading-relaxed text-muted">
          Provided by SDU University · Student Affairs. By continuing you accept the campus community rules.
        </p>
      </form>
    </div>
  );
}
