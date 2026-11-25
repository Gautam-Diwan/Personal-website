import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import type { GroupId } from "./groups";

/** Keep in sync with CONTENT_VERSION in convex/portfolio.ts */
export const CONTENT_VERSION = 3;

export type Project = Doc<"projects">;
export type Experience = Doc<"experiences">;

export const projectGroups = (p: { groups?: string[] }) =>
  (p.groups ?? []) as GroupId[];

/**
 * Loads all portfolio content and reseeds the Convex tables once if the
 * deployed content version is older than this build's.
 */
export function usePortfolio() {
  const projects = useQuery(api.portfolio.getProjects, {});
  const experiences = useQuery(api.portfolio.getExperiences, {});
  const skills = useQuery(api.portfolio.getSkills, {});
  const seed = useMutation(api.portfolio.seedPortfolioData);
  const requested = useRef(false);

  useEffect(() => {
    if (projects === undefined || skills === undefined || requested.current) return;
    const meta = skills.find((s) => s.category === "_meta" && s.name === "contentVersion");
    if (projects.length === 0 || !meta || meta.level < CONTENT_VERSION) {
      requested.current = true;
      void seed({});
    }
  }, [projects, skills, seed]);

  const contentSkills = skills?.filter((s) => s.category !== "_meta");
  const loading =
    projects === undefined || experiences === undefined || skills === undefined;

  return { projects, experiences, skills: contentSkills, loading };
}
