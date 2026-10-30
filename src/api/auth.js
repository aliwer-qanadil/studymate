const API_URL = "http://localhost:8080/api/auth";

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running.");
  }

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const problem = await response.json();
      const firstFieldError = problem.errors && Object.values(problem.errors)[0];
      message = firstFieldError || problem.detail || message;
    } catch {
      // the answer wasn't JSON, keep the default message
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

// Emails a 6-digit code to <studentId>@sdu.edu.kz
export function sendCode(studentId) {
  return post("/send-code", { studentId });
}

// Logs in with that code. The first successful login creates the account.
export function verifyCode(studentId, code) {
  return post("/verify-code", { studentId, code });
}
