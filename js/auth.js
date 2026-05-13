// js/auth.js
import { CLERK_PUBLISHABLE_KEY } from "./config.js";

let clerk;

export async function initClerk() {
  if (!window.Clerk) {
    throw new Error("Clerk script not loaded. Check your script tag.");
  }

  await window.Clerk.load({
    publishableKey: CLERK_PUBLISHABLE_KEY,
  });

  clerk = window.Clerk;
  return clerk;
}

export function getClerk() {
  if (!clerk) {
    throw new Error("Clerk not initialized. Call initClerk() first.");
  }
  return clerk;
}

export async function signOutUser() {
  const c = getClerk();
  await c.signOut();
}