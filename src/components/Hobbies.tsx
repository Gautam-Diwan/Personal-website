import { Music, Camera, Plane, Theater } from "lucide-react";

export function Hobbies() {
  const hobbies = [
    {
      icon: Theater,
      title: "Acting",
      description: "Exploring creative expression through performance and storytelling",
    },
    {
      icon: Camera,
      title: "Photography",
      description: "Capturing moments and perspectives through the lens",
    },
    {
      icon: Plane,
      title: "Travelling",
      description: "Exploring new cultures, places, and experiences around the world",
    },
    {
      icon: Music,
      title: "Listening to Music",
      description: "Discovering diverse sounds and enjoying music across genres",
    },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Hobbies & Interests
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hobbies.map((hobby) => {
          const Icon = hobby.icon;
          return (
            <div
              key={hobby.title}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-center"
            >
              <Icon className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {hobby.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {hobby.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
