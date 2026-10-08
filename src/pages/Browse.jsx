import Navbar from "../components/common/Navbar.jsx";
import BrowseTitle from "../components/browse/BrowseTitle.jsx";
import FilterBar from "../components/browse/FilterBar.jsx";
import RequestCard from "../components/browse/RequestCard.jsx";
import FullGroupCard from "../components/browse/FullGroupCard.jsx";
import Sidebar from "../components/browse/Sidebar.jsx";

// `requests` comes from App.jsx (see src/data/requests.js for the starting list)
export default function Browse({ requests }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar active="/browse" />

      <div className="grid flex-1 grid-cols-[1fr_316px]">
        <main className="border-r border-navy/10 p-8">
          <BrowseTitle count={requests.length} />
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
