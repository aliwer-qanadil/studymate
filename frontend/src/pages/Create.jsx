import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import CreateTitle from "../components/create/CreateTitle.jsx";
import SubjectFields from "../components/create/SubjectFields.jsx";
import DescriptionField, { DESCRIPTION_MAX } from "../components/create/DescriptionField.jsx";
import PlacePicker from "../components/create/PlacePicker.jsx";
import WhenFields from "../components/create/WhenFields.jsx";
import PreferenceChips from "../components/create/PreferenceChips.jsx";
import PreviewSidebar from "../components/create/PreviewSidebar.jsx";
import LoginPrompt from "../components/common/LoginPrompt.jsx";
import { createGroup, fromEnum, getUser, initialsOf } from "../api.js";
import { subjects } from "../data/subjects.js";
import { t } from "../i18n.js";

const places = ["LIBRARY", "CANTEEN", "TOP_FLOOR"];

// "Today", "Tomorrow", "Day after tomorrow" in the chosen language. The position is the number of days from today.
const days = t("create.days");

const times = ["09:00 – 11:00", "11:00 – 13:00", "14:00 – 16:00", "16:00 – 18:00", "18:00 – 20:00"];

const preferences = ["QUIET_WORK", "TALKATIVE", "MIXED_GROUP", "WOMEN_ONLY", "MEN_ONLY", "SAME_YEAR", "ANY_LEVEL"];

function dateInDays(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

export default function Create() {
  const user = getUser();
  const me = user
    ? { initials: initialsOf(user.name), name: user.name, faculty: t("common.sduUniversity") }
    : { initials: "G", name: t("common.guest"), faculty: t("common.notLoggedIn") };

  // Subject, course code, level and title live together, see SubjectFields
  const [form, setForm] = useState({ subject: subjects[0].name, code: subjects[0].code, level: "INTERMEDIATE", title: "" });
  const { subject, code, title } = form;
  const [description, setDescription] = useState("");
  const [place, setPlace] = useState(places[0]);
  const [exactSpot, setExactSpot] = useState("");
  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState(times[2]);
  const [groupSize, setGroupSize] = useState(4);
  const [chosenPreferences, setChosenPreferences] = useState(["QUIET_WORK"]);
  const [error, setError] = useState("");
  // Field errors: { code, title, description, spot, time }
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const navigate = useNavigate();

  // The live preview on the right uses this, so it updates as you type.
  const request = {
    code: code,
    title: subject + " — " + (title || t("create.yourTitleHere")),
    description: description,
    place: fromEnum(place),
    exactSpot: exactSpot, // only for accepted members, not shown on Browse
    time: day + ", " + time,
    style: chosenPreferences.length > 0 ? chosenPreferences.map(fromEnum).join(" · ") : t("common.noPreferences"),
    seatsLeft: groupSize - 1, // you already take one seat
    groupSize: groupSize,
    owner: me,
    highlight: true,
    mine: true,
  };

  function changeForm(changes) {
    setForm({ ...form, ...changes });
    const cleared = { ...errors };
    Object.keys(changes).forEach((name) => delete cleared[name]);
    setErrors(cleared);
  }

  // Errors under each field. The server checks the same rules again.
  function validate(startTime) {
    const found = {};
    if (code.trim() === "") found.code = t("create.errorCode");
    else if (code.trim().length > 32) found.code = t("create.errorCodeLong");
    if (title.trim() === "") found.title = t("create.errorTitle");
    else if (title.trim().length > 255) found.title = t("create.errorTitleLong", { count: title.trim().length });
    if (description.trim() === "") found.description = t("create.errorDescription");
    else if (description.trim().length > DESCRIPTION_MAX) found.description = t("create.errorDescriptionLong", { max: DESCRIPTION_MAX });
    if (exactSpot.trim().length > 255) found.spot = t("create.errorSpotLong");

    // "Today" with a slot that has already started is in the past (US-05)
    const now = new Date();
    const nowTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    if (days.indexOf(day) === 0 && startTime <= nowTime) found.time = t("create.errorTimePassed");
    return found;
  }

  // Server field names -> our field names
  function serverErrors(fields) {
    const names = { courseCode: "code", title: "title", description: "description", exactSpot: "spot", startTime: "time", timeRangeValid: "time", meetingDate: "time" };
    const found = {};
    for (const name in fields) {
      if (names[name]) found[names[name]] = fields[name];
    }
    return found;
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Guests can fill in the form to try it, but posting needs an account
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setError("");
    const [startTime, endTime] = time.split(" – ");
    const found = validate(startTime);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setError(t("create.fixFields"));
      return;
    }

    setSending(true);
    createGroup(user.id, {
      title: title.trim(),
      description: description.trim(),
      subjectName: subject,
      courseCode: code.trim(),
      level: form.level,
      place: place,
      exactSpot: exactSpot.trim(),
      meetingDate: dateInDays(days.indexOf(day)),
      startTime: startTime,
      endTime: endTime,
      preferences: chosenPreferences,
      groupSize: groupSize,
    })
      .then(() => navigate("/browse"))
      .catch((err) => {
        const fields = serverErrors(err.fields);
        setErrors(fields);
        setError(Object.keys(fields).length > 0 ? t("create.fixFields") : err.message);
      })
      .finally(() => setSending(false));
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar active="/create" />

      <div className="grid flex-1 lg:grid-cols-[1fr_380px]">
        <main className="min-w-0 border-navy/10 px-5 py-8 sm:px-10 sm:py-10 lg:border-r">
          <form onSubmit={handleSubmit} noValidate className="flex max-w-4xl flex-col gap-7">
            <CreateTitle />

            <SubjectFields subjects={subjects} form={form} change={changeForm} errors={errors} />

            <DescriptionField
              description={description}
              setDescription={(value) => {
                setDescription(value);
                setErrors({ ...errors, description: undefined });
              }}
              error={errors.description}
            />

            <PlacePicker
              places={places}
              place={place}
              setPlace={setPlace}
              exactSpot={exactSpot}
              setExactSpot={(value) => {
                setExactSpot(value);
                setErrors({ ...errors, spot: undefined });
              }}
              spotError={errors.spot}
            />

            <WhenFields
              days={days}
              day={day}
              setDay={(value) => {
                setDay(value);
                setErrors({ ...errors, time: undefined });
              }}
              times={times}
              time={time}
              setTime={(value) => {
                setTime(value);
                setErrors({ ...errors, time: undefined });
              }}
              timeError={errors.time}
              groupSize={groupSize}
              setGroupSize={setGroupSize}
            />

            <PreferenceChips
              preferences={preferences}
              chosen={chosenPreferences}
              setChosen={setChosenPreferences}
            />

            {error && <p role="alert" className="text-[13px] font-semibold text-clay">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="relative z-10 w-full rounded-full bg-navy px-10 py-4 text-sm font-bold text-white hover:bg-navy-dark disabled:opacity-60 sm:w-fit"
            >
              {sending ? t("create.posting") : t("create.post")}
            </button>
          </form>
        </main>

        <PreviewSidebar request={request} />
      </div>

      {showLoginPrompt && <LoginPrompt onClose={() => setShowLoginPrompt(false)} />}
    </div>
  );
}
