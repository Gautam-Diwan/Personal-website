import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Portfolio } from "./components/Portfolio";
import { Blog } from "./components/Blog";
import { useState } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'portfolio' | 'blog'>('portfolio');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Gautam Diwan</h1>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentPage('portfolio')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 'portfolio'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setCurrentPage('blog')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 'blog'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Blog
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="mailto:gdiwan@cs.cmu.edu"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Content currentPage={currentPage} />
      </main>

      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2024 Gautam Diwan. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a
                href="https://linkedin.com/in/gautamdiwan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/Gautam-Diwan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
              <a
                href="mailto:gdiwan@cs.cmu.edu"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function Content({ currentPage }: { currentPage: 'portfolio' | 'blog' }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentPage === 'portfolio') {
    return <Portfolio />;
  }

  return (
    <div>
      <Blog />
      <Unauthenticated>
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Admin Access</h3>
          <p className="text-gray-600 mb-4">Sign in to manage blog posts and portfolio content.</p>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
