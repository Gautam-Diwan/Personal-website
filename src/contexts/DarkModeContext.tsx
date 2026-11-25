import { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

function readSaved(): boolean {
  try {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true; // dark by default
  } catch {
    return true;
  }
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(readSaved);

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", JSON.stringify(isDark));
    } catch {
      /* storage unavailable */
    }
    document.documentElement.classList.toggle("dark", isDark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#0e141b" : "#ffffff");
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((d) => !d);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
