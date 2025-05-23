"use client";

const AUTH_KEY = "zoe-convert-auth-key";
const VALID_ACCESS_KEY = "zoeconvert2024"; // Hardcoded access key

export function login(accessKey: string): boolean {
  if (accessKey === VALID_ACCESS_KEY) {
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
