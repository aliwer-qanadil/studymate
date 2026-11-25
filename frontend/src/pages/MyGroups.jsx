import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import MyGroupsTitle from "../components/groups/MyGroupsTitle.jsx";
import OrganizedGroups from "../components/groups/OrganizedGroups.jsx";
import Loading from "../components/common/Loading.jsx";
import GuestNote from "../components/common/GuestNote.jsx";
import { getMyGroups, getUser } from "../api.js";
import { t } from "../i18n.js";

export default function MyGroups() {
  const user = getUser();
  const userId = user ? user.id : null;
  const [organized, setOrganized] = useState(null); // null until the server answers
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    getMyGroups(userId).then(setOrganized).catch((e) => setError(e.message));
  }, [userId]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar active="/groups" />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-8 sm:py-10">
        <MyGroupsTitle count={organized ? organized.length : 0} />

        {error && <p className="text-[13px] font-semibold text-clay">{error}</p>}

        {user ? (
          organized ? <OrganizedGroups groups={organized} /> : !error && <Loading />
        ) : (
          <GuestNote>{t("myGroups.guest")}</GuestNote>
        )}
      </main>
    </div>
  );
}
