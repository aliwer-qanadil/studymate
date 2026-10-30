import Leaf from "../autumn/Leaf.jsx";
import { initialsOf } from "../../api.js";

export default function ProfileCard({ user }) {
  const name = user ? user.name : "Guest";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-5">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-navy text-3xl font-bold text-white">
          {initialsOf(name)}
        </div>
        <div>
          <h1 className="text-[26px] font-semibold">{name}</h1>
          <p className="text-[14px] font-medium leading-relaxed text-ink">
            Engineering & Natural Sciences
            <br />
            Computer Science · Year 2
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-navy/15 bg-paper px-4 py-2 text-[13px] font-semibold">
          {user ? "Verified SDU student" : "Not logged in"}
        </span>
      </div>

      <span className="flex w-fit items-center gap-2 rounded-full bg-peach-light px-4 py-2 text-[13px] font-semibold">
        <Leaf size={14} color="#b9703c" />
        Autumn regular · 8 sessions in October
      </span>
    </div>
  );
}
