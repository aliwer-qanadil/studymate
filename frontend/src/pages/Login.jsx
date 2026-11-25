import LoginHero from "../components/login/LoginHero.jsx";
import LoginForm from "../components/login/LoginForm.jsx";
import LanguageToggle from "../components/common/LanguageToggle.jsx";

export default function Login() {
  return (
    <div className="relative grid min-h-screen bg-paper lg:grid-cols-2">
      <LoginHero />
      <LoginForm />
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>
    </div>
  );
}
