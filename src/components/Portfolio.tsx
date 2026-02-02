import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

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

  if (projects === undefined || experiences === undefined || skills === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const featuredProjects = projects.filter(p => p.featured);
  const workExperiences = experiences.filter(e => e.type === "work");
  const featuredSkills = skills.filter(s => s.featured);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Software Engineer & AI Enthusiast
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Master's student at Carnegie Mellon University specializing in scalable systems. 
          Passionate about building AI-powered applications and distributed systems that solve real-world problems.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:gdiwan@cs.cmu.edu"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get In Touch
          </a>
          <a
            href="https://github.com/Gautam-Diwan"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View GitHub
          </a>
        </div>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Education</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Carnegie Mellon University</h3>
                <p className="text-blue-600 font-medium">Master of Software Engineering - Scalable Systems</p>
                <p className="text-gray-600">GPA: 4.16/4.33</p>
                <p className="text-sm text-gray-500 mt-2">
                  Coursework: ML Systems, Diffusion and Flow Matching, API Design, Design Patterns, Quality Assurance
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-gray-600">Pittsburgh, PA</p>
                <p className="text-gray-500">December 2026</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Thapar Institute of Engineering and Technology</h3>
                <p className="text-blue-600 font-medium">Bachelor of Engineering in Computer Engineering</p>
                <p className="text-gray-600">Conversational AI Specialization</p>
                <p className="text-sm text-gray-500 mt-2">
                  Coursework: Data Science, Natural Language Processing
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-gray-600">Patiala, India</p>
                <p className="text-gray-500">June 2023</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Projects</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <div key={project._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    GitHub →
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Live Demo →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Experience</h2>
        <div className="space-y-8">
          {workExperiences.map((exp) => (
            <div key={exp._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-blue-600 font-medium">{exp.company}</p>
                  <p className="text-gray-600">{exp.location}</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="text-gray-500">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {exp.description.map((item, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="text-blue-600 mr-2 mt-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Skills</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(
            featuredSkills.reduce((acc, skill) => {
              if (!acc[skill.category]) acc[skill.category] = [];
              acc[skill.category].push(skill);
              return acc;
            }, {} as Record<string, typeof featuredSkills>)
          ).map(([category, categorySkills]) => (
            <div key={category} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
              <div className="space-y-3">
                {categorySkills.map((skill) => (
                  <div key={skill._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">{skill.name}</span>
                      <span className="text-sm text-gray-500">{skill.level}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">All Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                  {project.category}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-sm">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
