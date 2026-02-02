import { Mail, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6">
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Linkedin size={16} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/Gautam-Diwan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:gdiwan@cs.cmu.edu"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Mail size={16} />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
