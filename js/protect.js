// js/protect.js
import { initClerk } from "./auth.js";

export async function protectPage(redirectTo = "/login.html") {
  const clerk = await initClerk();

  if (!clerk.user) {
    window.location.href = redirectTo;
  }
}