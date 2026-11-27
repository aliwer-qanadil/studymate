import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Loading from "../components/common/Loading.jsx";
import ProfileStats from "../components/profile/ProfileStats.jsx";
import StudentSubjects from "../components/student/StudentSubjects.jsx";
import StudentStyle from "../components/student/StudentStyle.jsx";
import { getStudent, getUser, initialsOf } from "../api.js";
import { t } from "../i18n.js";

// Another student's public profile, e.g. an organizer checking an applicant
export default function StudentProfile() {
  const user = getUser();
  const userId = user ? user.id : null;
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    getStudent(userId, studentId).then(setStudent).catch((e) => setError(e.message));
  }, [userId, studentId]);

  if (!user) {
    return <Navigate to="/" />;
  }

  // Your own profile has its own page, where you can edit it
  if (Number(studentId) === user.id) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <div className="grid flex-1 lg:grid-cols-[420px_1fr]">
        <aside className="flex flex-col gap-7 border-b border-navy/10 bg-warm px-5 py-8 sm:px-7 lg:border-r lg:border-b-0 lg:py-10">
          <button onClick={() => navigate(-1)} className="w-fit text-[13px] font-bold text-peach-dark hover:underline">
            ← {t("student.back")}
          </button>

          {student && (
            <>
              <div className="flex items-center gap-5">
                <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-navy text-3xl font-bold text-white">
                  {initialsOf(student.name)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-[26px] font-semibold break-words">{student.name}</h1>
                  <p className="text-[14px] font-medium text-ink">{t("profile.verified")}</p>
                </div>
              </div>
              <ProfileStats profile={student} own={false} />
            </>
          )}
        </aside>

        <main className="flex min-w-0 flex-col gap-10 px-5 py-8 sm:px-10 sm:py-10">
          {error && <p className="text-[13px] font-semibold text-clay">{error}</p>}
          {!student && !error && <Loading />}

          {student && (
            <>
              <StudentSubjects subjects={student.subjects} />
              <StudentStyle studyStyle={student.studyStyle} places={student.favouritePlaces} />
              <p className="text-[12.5px] font-medium text-muted">{t("student.privacy")}</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
