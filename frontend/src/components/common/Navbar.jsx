import { Link, useNavigate } from "react-router-dom";
import crest from "../../assets/sdu-crest.png";
import { getUser, initialsOf, logout } from "../../api.js";
import AutumnToggle from "../autumn/AutumnToggle.jsx";
import LanguageToggle from "./LanguageToggle.jsx";
import { t } from "../../i18n.js";

const links = [
  { label: t("navbar.browse"), to: "/browse" },
  { label: t("navbar.create"), to: "/create" },
  { label: t("navbar.myGroups"), to: "/groups" },
  { label: t("navbar.requested"), to: "/requested" },
  { label: t("navbar.profile"), to: "/profile" },
];

export default function Navbar({ active }) {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-navy/10 px-4 py-3 sm:px-7 sm:py-4">
      <div className="flex items-center gap-3">
        <img src={crest} alt="SDU University" className="h-7.5" />
        <span className="h-5 w-px bg-navy/15"></span>
        <span className="font-serif text-[19px] font-medium whitespace-nowrap">Study Mate</span>
      </div>

      <nav aria-label="Main" className="order-last flex w-full gap-1 overflow-x-auto rounded-full bg-navy p-1 lg:order-none lg:w-auto">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              link.to === active
                ? "shrink-0 rounded-full bg-peach px-4 py-2 text-[12.5px] font-bold whitespace-nowrap text-navy sm:px-4.5"
                : "shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap text-white/70 hover:text-white sm:px-4.5"
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <AutumnToggle />
        <LanguageToggle />
        {user ? (
          <>
            <div className="flex size-8.5 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              {initialsOf(user.name)}
            </div>
            <button onClick={handleLogout} className="text-[12.5px] font-semibold text-muted hover:text-navy">
              {t("common.logOut")}
            </button>
          </>
        ) : (
          <Link to="/" className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-bold text-white hover:bg-navy-dark">
            {t("common.logIn")}
          </Link>
        )}
      </div>
    </header>
  );
}
