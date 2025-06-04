"use client";

const AUTH_KEY = "zoe-convert-auth-key";
// The access key is now stored in an environment variable
// NEXT_PUBLIC_ prefix is necessary for it to be available in client-side code
const VALID_ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY;

export function login(accessKey: string): boolean {
  // Ensure VALID_ACCESS_KEY is defined and matches, otherwise login fails
  if (VALID_ACCESS_KEY && accessKey === VALID_ACCESS_KEY) {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, "true");
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_KEY) === "true";
  }
  return false;
}
