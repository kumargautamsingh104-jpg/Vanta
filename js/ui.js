// js/ui.js
import { initClerk } from "./auth.js";

export async function loadNavbarUserInfo() {
  const clerk = await initClerk();

  const userBox = document.getElementById("userBox");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!userBox) return;

  if (clerk.user) {
    userBox.innerHTML = `
      <p>Welcome, <b>${clerk.user.firstName || clerk.user.primaryEmailAddress.emailAddress}</b></p>
    `;

    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    userBox.innerHTML = `<p>You are not logged in</p>`;
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}