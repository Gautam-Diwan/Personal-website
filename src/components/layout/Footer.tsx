import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { GROUPS } from "../../lib/groups";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t hairline">
      <div className="mx-auto grid max-w-page gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-3xl font-black leading-tight text-fg">
            Let's build something fast.
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Open to full-time ML systems, AI platform, and software engineering
            roles. Based in Pittsburgh, open to relocation.
          </p>
          <a
            href="mailto:gdiwan@cs.cmu.edu"
            className="group mt-6 inline-flex items-center gap-1.5 font-mono text-sm text-fg"
          >
            gdiwan@cs.cmu.edu
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            {GROUPS.map((g) => (
              <li key={g.id}>
                <Link
                  to={g.path}
                  className="inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: `rgb(var(${g.cssVar}))` }}
                  />
                  {g.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/blog"
                className="text-muted transition-colors hover:text-fg"
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Elsewhere</p>
          <ul className="space-y-2 text-sm">
            {[
              {
                href: "https://github.com/Gautam-Diwan",
                label: "GitHub",
                icon: Github,
              },
              {
                href: "https://linkedin.com/in/gautamdiwan",
                label: "LinkedIn",
                icon: Linkedin,
              },
              { href: "mailto:gdiwan@cs.cmu.edu", label: "Email", icon: Mail },
            ].map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
                >
                  <Icon size={14} /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-page flex-col justify-between gap-2 border-t hairline px-4 py-6 font-mono text-[11px] text-subtle sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} Gautam Diwan</span>
        <span>React · three.js · Framer Motion · Convex</span>
      </div>
    </footer>
  );
}
