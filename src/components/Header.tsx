import { Link, useLocation } from "@tanstack/react-router";
import { SignOutButton } from "../SignOutButton";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Moon, Sun, Mail, Linkedin, Github } from "lucide-react";

export function Header() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Gautam Diwan
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Portfolio
              </Link>
              <Link
                to="/blog"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/blog"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="mailto:gdiwan@cs.cmu.edu"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Mail size={16} />
              <span className="hidden sm:inline">Contact</span>
            </a>
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Linkedin size={16} />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href="https://github.com/Gautam-Diwan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github size={16} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
