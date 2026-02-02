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
      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-sm hover:shadow"
      onClick={() => void signOut()}
      title="Sign out of your account"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
