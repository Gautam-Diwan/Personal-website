import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Mail, Github, Linkedin, ExternalLink, Calendar, MapPin, GraduationCap, Briefcase } from "lucide-react";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 flex items-center justify-center text-white text-4xl font-bold">
            GD
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Software Engineer & AI Enthusiast
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            CS Master's student at Carnegie Mellon University. 
            Passionate about building AI powered applications and web applications that solve real world problems.
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
          <GraduationCap className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Education</h2>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Carnegie Mellon University</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Master of Software Engineering - Scalable Systems</p>
                <p className="text-gray-600 dark:text-gray-300">GPA: 4.16/4.33</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Coursework: ML Systems, Diffusion and Flow Matching, API Design, Design Patterns, Quality Assurance
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
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Thapar Institute of Engineering and Technology</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Bachelor of Engineering in Computer Engineering</p>
                <p className="text-gray-600 dark:text-gray-300">Conversational AI Specialization</p>
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Projects</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <div key={project._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full capitalize">
                  {project.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>{project.startDate} - {project.endDate || "Present"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
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
                    className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    <ExternalLink size={16} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <Briefcase className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Experience</h2>
        </div>
        <div className="space-y-8">
          {workExperiences.map((exp) => (
            <div key={exp._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.position}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                    <MapPin size={16} className="mr-1" />
                    <span>{exp.location}</span>
                  </div>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar size={16} className="mr-1" />
                    <span>{exp.startDate} - {exp.endDate || "Present"}</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {exp.description.map((item, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2 mt-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Skills</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(
            featuredSkills.reduce((acc, skill) => {
              if (!acc[skill.category]) acc[skill.category] = [];
              acc[skill.category].push(skill);
              return acc;
            }, {} as Record<string, typeof featuredSkills>)
          ).map(([category, categorySkills]) => (
            <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{category}</h3>
              <div className="space-y-3">
                {categorySkills.map((skill) => (
                  <div key={skill._id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}/5</span>
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">All Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full capitalize">
                  {project.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{project.description}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Calendar size={14} className="mr-1" />
                <span>{project.startDate} - {project.endDate || "Present"}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
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
                    className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Github size={14} />
                    <span>GitHub</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <ExternalLink size={14} />
                    <span>Live Demo</span>
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
