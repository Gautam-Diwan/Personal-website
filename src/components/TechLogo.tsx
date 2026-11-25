import { useDarkMode } from "../contexts/DarkModeContext";
import { brandColor, iconFor } from "../lib/techIcons";

/** Brand mark for a technology name, or nothing when there is no known logo. */
export function TechLogo({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const { isDark } = useDarkMode();
  const icon = iconFor(name);
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill={brandColor(icon, isDark)}
    >
      <path d={icon.path} />
    </svg>
  );
}

/** Colored pill: brand mark plus label, tinted with the brand color. */
export function TechPill({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const { isDark } = useDarkMode();
  const icon = iconFor(name);
  const color = icon ? brandColor(icon, isDark) : "rgb(var(--muted))";
  const pad =
    size === "lg"
      ? "px-4 py-2 text-sm gap-2.5"
      : size === "sm"
        ? "px-2 py-0.5 text-[11.5px] gap-1.5"
        : "px-3 py-1 text-[12.5px] gap-2";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium text-fg ${pad}`}
      style={{
        borderColor: icon
          ? `${color}66`
          : "rgb(var(--line) / var(--line-alpha))",
        background: icon ? `${color}1A` : "rgb(var(--fg) / 0.04)",
      }}
    >
      <TechLogo
        name={name}
        size={size === "lg" ? 18 : size === "sm" ? 12 : 14}
      />
      {name}
    </span>
  );
}
