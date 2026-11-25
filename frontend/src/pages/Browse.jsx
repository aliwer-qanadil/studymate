import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import BrowseTitle from "../components/browse/BrowseTitle.jsx";
import FilterBar from "../components/browse/FilterBar.jsx";
import RequestCard from "../components/browse/RequestCard.jsx";
import Sidebar from "../components/browse/Sidebar.jsx";
import LoginPrompt from "../components/common/LoginPrompt.jsx";
import Loading from "../components/common/Loading.jsx";
import ApplyForm from "../components/apply/ApplyForm.jsx";
import { fromEnum, getGroups, getMyRequests, getProfile, getUser, initialsOf, whenText } from "../api.js";
import { t } from "../i18n.js";

function partOfDay(time) {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

// "2026-11-25" for today plus the given number of days, in the browser's time zone
function isoDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

function inRange(group, range) {
  if (range === "today") return group.meetingDate === isoDate(0);
  if (range === "week") return group.meetingDate <= isoDate(6);
  return true;
}

function matchesFilters(group, filters) {
  const search = filters.search.trim().toLowerCase();
  const text = (group.subjectName + " " + group.courseCode + " " + group.title).toLowerCase();

  return (
    (filters.subject === "" || group.subjectName === filters.subject) &&
    (filters.place === "" || group.place === filters.place) &&
    (filters.time === "" || partOfDay(group.startTime) === filters.time) &&
    inRange(group, filters.range) &&
    (search === "" || text.includes(search))
  );
}

function toCard(group, user, sentGroupIds) {
  const mine = user !== null && group.organizer.id === user.id;

  return {
    id: group.id,
    code: group.courseCode,
    level: fromEnum(group.level).toUpperCase(),
    title: group.subjectName + " — " + group.title,
    description: group.description,
    place: fromEnum(group.place),
    time: whenText(group),
    style: group.preferences.length > 0 ? group.preferences.map(fromEnum).join(" · ") : t("common.noPreferences"),
    seatsLeft: group.seatsLeft,
    groupSize: group.groupSize,
    owner: { initials: initialsOf(group.organizer.name), name: group.organizer.name, faculty: t("common.sduUniversity") },
    highlight: mine,
    mine: mine,
    sent: sentGroupIds.includes(group.id),
    group: group,
  };
}

export default function Browse() {
  const user = getUser();
  const userId = user ? user.id : null;
  const [groups, setGroups] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [sentGroupIds, setSentGroupIds] = useState([]);
  // "" means "All" / "Any"
  const [filters, setFilters] = useState({ subject: "", place: "", time: "", search: "", mineFirst: true, range: "all" });
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  // The group whose application form is open
  const [applying, setApplying] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // Guests can see the groups too, they just have no requests of their own
    getGroups()
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));

    if (!userId) return;

    getProfile(userId).then(setProfile).catch(() => setProfile(null));

    getMyRequests(userId)
      .then((requests) => setSentGroupIds(requests.filter((r) => r.status !== "CANCELLED").map((r) => r.groupId)))
      .catch((e) => setError(e.message));
  }, [userId]);

  function handleJoin(group) {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setNotice("");
    setApplying(group);
  }

  function handleSent(request) {
    setSentGroupIds([...sentGroupIds, request.groupId]);
    setNotice(t("apply.sent", { name: applying.organizer.name, score: request.score }));
    setApplying(null);
  }

  // Course codes on my profile. With "Matches me first" on, their groups go to the top.
  const myCodes = profile ? profile.subjects.map((s) => s.courseCode) : [];
  const isMySubject = (group) => myCodes.includes(group.courseCode);
  const sortedGroups = filters.mineFirst
    ? [...groups].sort((a, b) => Number(isMySubject(b)) - Number(isMySubject(a)))
    : groups;

  const subjects = [...new Set(groups.map((group) => group.subjectName))];
  const cards = sortedGroups
    .filter((group) => matchesFilters(group, filters))
    .map((group) => toCard(group, user, sentGroupIds));

  // Up to three open groups in my subjects that I haven't asked to join and don't organize
  const picks = groups
    .filter((group) => isMySubject(group) && group.organizer.id !== userId && !sentGroupIds.includes(group.id))
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar active="/browse" />

      <div className="grid flex-1 lg:grid-cols-[1fr_316px]">
        <main className="min-w-0 border-navy/10 px-4 py-6 sm:p-8 lg:border-r">
          <BrowseTitle count={cards.length} range={filters.range} setRange={(range) => setFilters({ ...filters, range: range })} />
          <FilterBar subjects={subjects} filters={filters} setFilters={setFilters} canSortMine={profile !== null} />

          {error && <p role="alert" className="mb-4 text-[13px] font-semibold text-clay">{error}</p>}
          {notice && (
            <p role="status" className="mb-4 rounded-xl bg-sage-light px-4 py-3 text-[13px] font-semibold text-sage">
              {notice}
            </p>
          )}

          <div className="flex flex-col gap-3.5">
            {!loaded && <Loading />}
            {loaded && !error && cards.length === 0 && (
              <p className="rounded-2xl border border-dashed border-navy/20 p-6 text-sm font-medium text-muted">
                {groups.length === 0 ? t("browse.noGroups") : t("browse.noMatches")}
              </p>
            )}
            {cards.map((card) => (
              <RequestCard key={card.id} request={card} onJoin={() => handleJoin(card.group)} />
            ))}
          </div>
        </main>

        <Sidebar profile={profile} picks={picks} />
      </div>

      {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}
      {applying && <ApplyForm user={user} group={applying} onClose={() => setApplying(null)} onSent={handleSent} />}
    </div>
  );
}
