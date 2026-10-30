import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Diamond from "../components/ui/Diamond";
import { sendCode, verifyCode } from "../api/auth";
import logo from "../assets/sdu-logo.png";
import campus from "../assets/sdu-campus.png";
import "./SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState("id"); // "id" -> "code"
  const [studentId, setStudentId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onlyDigits = (value, max) => value.replace(/\D/g, "").slice(0, max);

  async function requestCode() {
    if (!/^\d{9}$/.test(studentId)) {
      setError("Enter your 9-digit student ID.");
      return false;
    }
    setBusy(true);
    setError("");
    try {
      await sendCode(studentId);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (step === "id") {
      if (await requestCode()) {
        setCode("");
        setStep("code");
      }
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await verifyCode(studentId, code);
      navigate("/browse");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function changeStudentId() {
    setStep("id");
    setCode("");
    setError("");
  }

  return (
    <div className="sm-shell">
      <div className="sm-screen sm-signin">
        <div className="sm-signin__brandside">
          <div className="sm-signin__lockup">
            <div className="sm-signin__logoBox">
              <img src={logo} alt="SDU University" />
            </div>
            <div>
              <div className="sm-signin__wordmark">Study Mate</div>
              <div className="sm-signin__by">By SDU University</div>
            </div>
          </div>

          <div>
            <p className="sm-signin__pitch">Find someone to study with, on campus, today.</p>
            <div className="sm-signin__quote">
              <Diamond size={9} style={{ marginTop: 7 }} />
              <p>“Docendo discimus.” By teaching, we learn. — Seneca</p>
            </div>
          </div>

          <div className="sm-signin__photo">
            <img src={campus} alt="SDU campus" />
          </div>
        </div>

        <form className="sm-signin__form" onSubmit={handleSubmit}>
          <div>
            <div className="sm-eyebrow">Student access</div>
            <h2 className="sm-signin__title">Welcome back</h2>
            <p className="sm-signin__sub">
              {step === "id"
                ? "Enter your student ID and we will email you a one-time login code. Study Mate is open to SDU students only."
                : `We sent a 6-digit code to ${studentId}@sdu.edu.kz. It works for 10 minutes.`}
            </p>
          </div>

          <div className="sm-signin__fields">
            {step === "id" ? (
              <label className="sm-signin__field">
                <span className="sm-signin__label">Student ID</span>
                <span className="sm-signin__input">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    placeholder="250118021"
                    aria-label="Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(onlyDigits(e.target.value, 9))}
                    autoFocus
                  />
                  <span className="sm-signin__domain">@sdu.edu.kz</span>
                </span>
              </label>
            ) : (
              <label className="sm-signin__field">
                <span className="sm-signin__label">Code from your email</span>
                <span className="sm-signin__input">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    aria-label="Login code"
                    value={code}
                    onChange={(e) => setCode(onlyDigits(e.target.value, 6))}
                    autoFocus
                  />
                </span>
              </label>
            )}

            {error && (
              <p className="sm-signin__error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="sm-signin__actions">
            <Button type="submit" variant="primary" size="lg" block disabled={busy}>
              {step === "id" ? "Send me a code" : "Log in"}
            </Button>

            {step === "code" && (
              <div className="sm-signin__row">
                <button type="button" className="sm-signin__link" onClick={changeStudentId}>
                  Use a different student ID
                </button>
                <button type="button" className="sm-signin__link" onClick={requestCode} disabled={busy}>
                  Send the code again
                </button>
              </div>
            )}
          </div>

          <p className="sm-signin__legal">
            Provided by SDU University · Student Affairs. By continuing you accept the campus
            community rules.
          </p>
        </form>
      </div>
    </div>
  );
}
