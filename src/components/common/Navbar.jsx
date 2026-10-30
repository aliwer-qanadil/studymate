import { Link, useNavigate } from "react-router-dom";
import crest from "../../assets/sdu-crest.png";
import { getUser, initialsOf, logout } from "../../api.js";
import AutumnToggle from "../autumn/AutumnToggle.jsx";

const links = [
  { label: "Browse", to: "/browse" },
  { label: "Create", to: "/create" },
  { label: "My groups", to: "/groups" },
  { label: "Requested", to: "/requested" },
  { label: "Profile", to: "/profile" },
];

export default function Navbar({ active }) {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="flex items-center justify-between gap-6 border-b border-navy/10 px-7 py-4">
      <div className="flex items-center gap-3">
        <img src={crest} alt="SDU University" className="h-7.5" />
        <span className="h-5 w-px bg-navy/15"></span>
        <span className="font-serif text-[19px] font-medium">Study Mate</span>
      </div>

      <nav className="flex gap-1 rounded-full bg-navy p-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              link.to === active
                ? "rounded-full bg-peach px-4.5 py-2 text-[12.5px] font-bold text-navy"
                : "rounded-full px-4.5 py-2 text-[12.5px] font-semibold text-white/70 hover:text-white"
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <AutumnToggle />
        <div className="flex gap-0.5 rounded-full bg-peach p-0.75 text-[11px] font-bold">
          <span className="rounded-full px-2.5 py-1 text-[#5A3418]">KZ</span>
          <span className="rounded-full px-2.5 py-1 text-[#5A3418]">RU</span>
          <span className="rounded-full bg-paper px-2.5 py-1 text-navy">EN</span>
        </div>
        {user ? (
          <>
            <div className="flex size-8.5 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              {initialsOf(user.name)}
            </div>
            <button onClick={handleLogout} className="text-[12.5px] font-semibold text-muted hover:text-navy">
              Log out
            </button>
          </>
        ) : (
          <Link to="/" className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-bold text-white hover:bg-navy-dark">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
