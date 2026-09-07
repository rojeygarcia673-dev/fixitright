import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles auth; signed-in users land on the dashboard,
  // everyone else is redirected to /login.
  redirect("/dashboard");
}
