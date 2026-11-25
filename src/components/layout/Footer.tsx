import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Linkedin, Mail, PenLine } from "lucide-react";
import { GROUPS } from "../../lib/groups";
import { playPop } from "../../lib/sound";
import { TechLogo } from "../TechLogo";

const kicker = "text-sm font-extrabold uppercase tracking-[0.14em] text-muted";
const link =
  "inline-flex items-center gap-2 text-base font-bold underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-current";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t hairline">
      <div className="mx-auto grid max-w-page gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-3xl font-black leading-tight tracking-tight text-fg sm:text-4xl">
            Let&rsquo;s build something{" "}
            <span style={{ color: "rgb(var(--accent))" }}>fast</span>.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Open to full-time ML systems, AI platform, and software engineering
            roles. Based in Pittsburgh, open to relocation.
          </p>
          <a
            href="mailto:gdiwan@cs.cmu.edu"
            onClick={() => playPop(1.1)}
            className="btn-primary mt-7"
          >
            gdiwan@cs.cmu.edu <ArrowUpRight size={17} />
          </a>
        </div>

        <nav aria-label="Footer: explore">
          <p className={kicker}>Explore</p>
          <ul className="mt-4 space-y-3">
            {GROUPS.map((g, i) => {
              const Icon = g.icon;
              return (
                <li key={g.id}>
                  <Link
                    to={g.path}
                    onClick={() => playPop(0.9 + i * 0.08)}
                    className={link}
                    style={{ color: `rgb(var(${g.cssVar}))` }}
                  >
                    <Icon size={17} strokeWidth={2.5} /> {g.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/blog"
                onClick={() => playPop(1.2)}
                className={`${link} text-fg`}
              >
                <PenLine size={17} strokeWidth={2.5} /> Blog
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Footer: elsewhere">
          <p className={kicker}>Elsewhere</p>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href="https://github.com/Gautam-Diwan"
                target="_blank"
                rel="noreferrer"
                className={`${link} text-fg`}
              >
                <TechLogo name="GitHub" size={17} /> GitHub
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/gautamdiwan"
                target="_blank"
                rel="noreferrer"
                className={`${link} text-fg`}
              >
                <Linkedin size={17} style={{ color: "#0A66C2" }} /> LinkedIn
              </a>
            </li>
            <li>
              <a href="mailto:gdiwan@cs.cmu.edu" className={`${link} text-fg`}>
                <Mail size={17} strokeWidth={2.5} /> Email
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-page flex-col justify-between gap-2 border-t hairline px-4 py-6 text-sm font-semibold text-muted sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} Gautam Diwan</span>
        <span>Built with React, three.js, Framer Motion, and Convex</span>
      </div>
    </footer>
  );
}
