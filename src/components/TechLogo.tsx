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
  // Plain brand mark + name (no pill), as on the home page; a small dot stands in when
  // there is no known logo so items still line up.
  const text =
    size === "lg"
      ? "text-base gap-2"
      : size === "sm"
        ? "text-[13px] gap-1.5"
        : "text-sm gap-1.5";
  const px = size === "lg" ? 18 : size === "sm" ? 14 : 15;
  return (
    <span className={`inline-flex items-center font-semibold text-fg ${text}`}>
      {iconFor(name) ? (
        <TechLogo name={name} size={px} />
      ) : (
        <span
          className="mx-[4px] h-1.5 w-1.5 rounded-full bg-subtle"
          aria-hidden="true"
        />
      )}
      {name}
    </span>
  );
}
