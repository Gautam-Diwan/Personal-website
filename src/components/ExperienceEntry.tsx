import { Calendar, MapPin } from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";

interface ExperienceEntryProps {
  experience: Doc<"experiences">;
}

export function ExperienceEntry({ experience }: ExperienceEntryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {experience.position}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            {experience.company}
          </p>
          <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
            <MapPin size={16} className="mr-1" />
            <span>{experience.location}</span>
          </div>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Calendar size={16} className="mr-1" />
            <span>{experience.startDate} - {experience.endDate || "Present"}</span>
          </div>
        </div>
      </div>
      <ul className="space-y-2 mb-4">
        {experience.description.map((item, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
            <span className="text-blue-600 dark:text-blue-400 mr-2 mt-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {experience.technologies.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
