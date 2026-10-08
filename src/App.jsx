import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Browse from "./pages/Browse.jsx";
import Create from "./pages/Create.jsx";
import { startingRequests } from "./data/requests.js";

export default function App() {
  // The list of requests lives here (not inside Browse), because two pages need it:
  // Browse shows the list, Create adds to it.
  const [requests, setRequests] = useState(startingRequests);

  function addRequest(newRequest) {
    // New list = the new request first, then all the old ones
    setRequests([newRequest, ...requests]);
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/browse" element={<Browse requests={requests} />} />
      <Route path="/create" element={<Create onPost={addRequest} />} />

      {/* Any other address (pages we haven't built yet) goes back to Browse */}
      <Route path="*" element={<Navigate to="/browse" />} />
    </Routes>
  );
}
