import Navbar from "../components/Navbar.jsx";
import BrowseTitle from "../components/browse/BrowseTitle.jsx";
import FilterBar from "../components/browse/FilterBar.jsx";
import RequestCard from "../components/browse/RequestCard.jsx";
import FullGroupCard from "../components/browse/FullGroupCard.jsx";
import Sidebar from "../components/browse/Sidebar.jsx";

const requests = [
  {
    id: 1,
    code: "MATH 161",
    match: 92,
    title: "Calculus II — integration techniques before Friday's quiz",
    description: "Working through the practice set together, then explaining solutions out loud to each other. Bring your own paper.",
    place: "Library · 2nd floor",
    time: "Today, 14:00 – 16:00",
    style: "Quiet work",
    seatsLeft: 2,
    groupSize: 4,
    owner: { initials: "DS", name: "Dana S.", faculty: "Engineering & Natural Sciences · Year 2", rating: 4.8 },
    highlight: true, // the best match gets the peach stripe
  },
  {
    id: 2,
    code: "CS 204",
    match: 78,
    title: "Data structures — pair-explaining graph traversal",
    description: "Whiteboard session. Everyone teaches one algorithm to the group — BFS, DFS, Dijkstra.",
    place: "Top floor · study pods",
    time: "Today, 17:30 – 19:00",
    style: "Talkative",
    seatsLeft: 3,
    groupSize: 4,
    owner: { initials: "AB", name: "Arman B.", faculty: "Engineering & Natural Sciences · Year 3", rating: 4.6 },
    highlight: false,
  },
  {
    id: 3,
    code: "ENG 102",
    match: 71,
    title: "Academic English — essay peer review over coffee",
    description: "Bring a draft. We read each other's introductions and thesis statements aloud.",
    place: "Canteen · window side",
    time: "Tomorrow, 12:30 – 13:30",
    style: "Women only",
    seatsLeft: 1,
    groupSize: 3,
    owner: { initials: "MK", name: "Madina K.", faculty: "Education & Humanities · Year 1", rating: 4.9 },
    highlight: false,
  },
];

export default function Browse() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar active="/browse" />

      <div className="grid flex-1 grid-cols-[1fr_316px]">
        <main className="border-r border-navy/10 p-8">
          <BrowseTitle />
          <FilterBar />

          <div className="flex flex-col gap-3.5">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
            <FullGroupCard />
          </div>
        </main>

        <Sidebar />
      </div>
    </div>
  );
}
