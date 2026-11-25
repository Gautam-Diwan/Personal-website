"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors hover:shadow"
      onClick={() => void signOut()}
      title="Sign out of your account"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
