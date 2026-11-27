import { Link } from "react-router-dom";

// A student's name that opens their public profile
export default function StudentLink({ student, className = "" }) {
  return (
    <Link to={"/students/" + student.id} className={"hover:underline " + className}>
      {student.name}
    </Link>
  );
}
