import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { GROUP_BY_ID, type GroupId } from "./groups";
import {
  experiences as seedExperiences,
  projects as seedProjects,
  skills as seedSkills,
} from "../../convex/content";

/** Keep in sync with CONTENT_VERSION in convex/portfolio.ts */
export const CONTENT_VERSION = 6;

export type Project = Doc<"projects">;
export type Experience = Doc<"experiences">;

export const projectGroups = (p: { groups?: string[] }) =>
  (p.groups ?? []) as GroupId[];

/**
 * Projects in a group, pinned slugs first (e.g. BusTub for Systems), then by recency.
 * Use this everywhere a group's projects are listed so the order is consistent.
 */
export function projectsInGroup<T extends { slug?: string; groups?: string[] }>(
  projects: T[],
  groupId: GroupId,
): T[] {
  const pinned = GROUP_BY_ID[groupId].pinned ?? [];
  const rank = (slug?: string) => {
    const i = pinned.indexOf(slug ?? "");
    return i === -1 ? pinned.length : i;
  };
  // Array.prototype.sort is stable, so unpinned projects keep their recency order
  return projects
    .filter((p) => projectGroups(p).includes(groupId))
    .sort((a, b) => rank(a.slug) - rank(b.slug));
}

/*
 * Bundled copy of the same content that is seeded into Convex (convex/content.ts).
 * Pages render from it immediately, so they never depend on the Convex WebSocket being
 * reachable: some browsers, privacy extensions, DNS filters, and corporate networks
 * block wss:// to convex.cloud, which previously left every list stuck on skeletons.
 * Live Convex data replaces it as soon as it arrives and is at the current version.
 */
const byRecency = <T extends { sortKey?: number }>(rows: T[]) =>
  rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (b.r.sortKey ?? 0) - (a.r.sortKey ?? 0) || a.i - b.i)
    .map(({ r }) => r);

const STATIC_PROJECTS = byRecency(
  seedProjects.map((p, i) => ({
    ...p,
    _id: `static-project-${p.slug}`,
    _creationTime: i,
  })),
) as unknown as Project[];

const STATIC_EXPERIENCES = byRecency(
  seedExperiences.map((e, i) => ({
    ...e,
    _id: `static-experience-${i}`,
    _creationTime: i,
  })),
) as unknown as Experience[];

const STATIC_SKILLS = seedSkills.flatMap((group, gi) =>
  group.items.map((name, i) => ({
    _id: `static-skill-${gi}-${i}`,
    _creationTime: gi * 100 + i,
    category: group.category,
    name,
    level: 4,
    featured: i < 4,
  })),
) as unknown as Doc<"skills">[];

/**
 * Portfolio content for the UI. Returns the bundled content immediately and switches to
 * live Convex data once it is loaded and current; also reseeds Convex once if the
 * deployed content version is older than this build's.
 */
export function usePortfolio() {
  const projects = useQuery(api.portfolio.getProjects, {});
  const experiences = useQuery(api.portfolio.getExperiences, {});
  const skills = useQuery(api.portfolio.getSkills, {});
  const seed = useMutation(api.portfolio.seedPortfolioData);
  const requested = useRef(false);

  const meta = skills?.find(
    (s) => s.category === "_meta" && s.name === "contentVersion",
  );
  const liveIsCurrent =
    projects !== undefined &&
    experiences !== undefined &&
    skills !== undefined &&
    projects.length > 0 &&
    meta !== undefined &&
    meta.level >= CONTENT_VERSION;

  useEffect(() => {
    if (projects === undefined || skills === undefined || requested.current)
      return;
    if (!liveIsCurrent) {
      requested.current = true;
      seed({}).catch(() => {
        /* offline or blocked: the bundled content is already showing */
      });
    }
  }, [projects, skills, seed, liveIsCurrent]);

  if (liveIsCurrent) {
    return {
      projects,
      experiences,
      skills: skills.filter((s) => s.category !== "_meta"),
      loading: false,
      source: "live" as const,
    };
  }
  return {
    projects: STATIC_PROJECTS,
    experiences: STATIC_EXPERIENCES,
    skills: STATIC_SKILLS,
    loading: false,
    source: "bundled" as const,
  };
}
