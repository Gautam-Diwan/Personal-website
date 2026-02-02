import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import {
  Mail,
  Github,
  Linkedin,
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
} from "lucide-react";
import { ExperienceEntry } from "./ExperienceEntry";
import { ProjectCard } from "./ProjectCard";
import { Hobbies } from "./Hobbies";

export function Portfolio() {
  const projects = useQuery(api.portfolio.getProjects, {});
  const experiences = useQuery(api.portfolio.getExperiences, {});
  const skills = useQuery(api.portfolio.getSkills, {});
  const seedData = useMutation(api.portfolio.seedPortfolioData);

  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Auto-seed data if no projects exist
    if (projects !== undefined && projects.length === 0 && !isSeeding) {
      setIsSeeding(true);
      seedData({}).then(() => {
        setIsSeeding(false);
      });
    }
  }, [projects, seedData, isSeeding]);

  if (
    projects === undefined ||
    experiences === undefined ||
    skills === undefined
  ) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const featuredProjects = projects.filter((p) => p.featured);
  const featuredSkills = skills.filter((s) => s.featured);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 flex items-center justify-center text-white text-4xl font-bold">
            GD
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Software Engineer & AI Enthusiast
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-2">
            I turn caffeine ☕ into code, ideas into AI systems, and "it works
            on my machine" into scalable production applications.
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Currently pursuing my Software Engineering Master's at Carnegie
            Mellon University, where I'm building the future (and occasionally
            debugging the past). Passionate about crafting elegant solutions to
            complex problems and making machines do cool stuff.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:gdiwan@cs.cmu.edu"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
          >
            <Mail size={20} />
            <span>Get In Touch</span>
          </a>
          <a
            href="https://github.com/Gautam-Diwan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <Github size={20} />
            <span>View GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/gautamdiwan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <Linkedin size={20} />
            <span>View LinkedIn</span>
          </a>
        </div>
      </section>

      {/* Education */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <GraduationCap
            className="text-blue-600 dark:text-blue-400"
            size={32}
          />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Education
          </h2>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Carnegie Mellon University
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Master of Software Engineering - Scalable Systems
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  GPA: 4.16/4.33
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Coursework: ML Systems, Diffusion and Flow Matching, API
                  Design, Design Patterns, Quality Assurance
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                  <MapPin size={16} className="mr-1" />
                  <span>Pittsburgh, PA</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-1" />
                  <span>December 2026</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Thapar Institute of Engineering and Technology
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Bachelor of Engineering in Computer Engineering
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Conversational AI Specialization
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Coursework: Data Science, Natural Language Processing
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                  <MapPin size={16} className="mr-1" />
                  <span>Patiala, India</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-1" />
                  <span>June 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Featured Projects
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {featuredProjects
            .sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime(),
            )
            .map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                featured={true}
              />
            ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <Briefcase className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Experience
          </h2>
        </div>
        <div className="space-y-8">
          {experiences
            .sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime(),
            )
            .map((exp) => (
              <ExperienceEntry key={exp._id} experience={exp} />
            ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Skills
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(
            featuredSkills.reduce(
              (acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              },
              {} as Record<string, typeof featuredSkills>,
            ),
          ).map(([category, categorySkills]) => (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {category}
              </h3>
              <div className="space-y-3">
                {categorySkills.map((skill) => (
                  <div key={skill._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {skill.level}/5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Projects */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          All Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime(),
            )
            .map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                featured={false}
              />
            ))}
        </div>
      </section>

      {/* Hobbies */}
      <Hobbies />
    </div>
  );
}
