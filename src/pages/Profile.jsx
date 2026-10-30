import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import ProfileCard from "../components/profile/ProfileCard.jsx";
import SocialRating from "../components/profile/SocialRating.jsx";
import RatingNote from "../components/profile/RatingNote.jsx";
import SubjectList from "../components/profile/SubjectList.jsx";
import StatsRow from "../components/profile/StatsRow.jsx";
import StudyStyle from "../components/profile/StudyStyle.jsx";
import RecentSessions from "../components/profile/RecentSessions.jsx";
import Settings from "../components/profile/Settings.jsx";
import { getUser, logout } from "../api.js";

// Example data until the backend has profiles. Only the name and the Settings section are real for now.
const subjects = ["Calculus II", "Data Structures", "Discrete Math", "Academic English", "Kazakh History"];

const stats = [
  { number: 23, label: "Sessions attended" },
  { number: 14, label: "Times you taught" },
  { number: 31, label: "Students met" },
];

const ratings = [
  { label: "Reliability", score: 4.9 },
  { label: "Behaviour", score: 4.8 },
  { label: "Helpfulness", score: 4.5 },
];

const places = ["Library", "Top floor", "Canteen"];
const favouritePlaces = ["Library", "Top floor"];

const sessions = [
  { title: "Discrete Math — proof drills", where: "Library · 24 Oct", taught: true },
  { title: "Data Structures — graph traversal", where: "Top floor · 21 Oct", taught: false },
  { title: "Academic English — essay review", where: "Canteen · 17 Oct", taught: false },
];

export default function Profile() {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar active="/profile" />

      <div className="grid flex-1 lg:grid-cols-[420px_1fr]">
        <aside className="flex flex-col gap-7 border-r border-navy/10 bg-warm px-7 py-10">
          <ProfileCard user={user} />
          <SocialRating overall={4.7} sessions={23} ratings={ratings} />
          <RatingNote />
        </aside>

        <main className="flex flex-col gap-10 px-10 py-10">
          <SubjectList subjects={subjects} />
          <StatsRow stats={stats} />
          <StudyStyle places={places} favouritePlaces={favouritePlaces} />
          <RecentSessions sessions={sessions} />
          <Settings loggedIn={user !== null} onLogout={handleLogout} />
        </main>
      </div>
    </div>
  );
}
