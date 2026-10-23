"use client";
// Local testing only (NEXT_PUBLIC_AUTH_MODE=dev): act as one of the seeded test users.
import { useEffect, useState } from "react";
import { AUTH_MODE, devUser } from "@/lib/api";

const USERS = [
  { sub: "", label: "Signed out" },
  { sub: "dev-citizen", label: "Citizen (verified, Lagos)" },
  { sub: "dev-unverified", label: "Citizen (unverified)" },
  { sub: "dev-editor", label: "Editor" },
  { sub: "dev-admin", label: "Admin" },
];

export function DevUserSwitcher() {
  const [value, setValue] = useState("");
  useEffect(() => setValue(devUser.get() ?? ""), []);
  if (AUTH_MODE !== "dev") return null;
  return (
    <select
      aria-label="Test user"
      value={value}
      style={{ width: "auto", minHeight: 36, fontSize: "0.85rem" }}
      onChange={(e) => {
        setValue(e.target.value);
        devUser.set(e.target.value || null);
      }}
    >
      {USERS.map((u) => (
        <option key={u.sub} value={u.sub}>
          {u.label}
        </option>
      ))}
    </select>
  );
}

/** Re-renders when the test user changes. */
export function useAuthVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const bump = () => setV((x) => x + 1);
    window.addEventListener("pol-auth", bump);
    return () => window.removeEventListener("pol-auth", bump);
  }, []);
  return v;
}
