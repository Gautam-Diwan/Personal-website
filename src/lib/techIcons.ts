/**
 * Brand marks from Simple Icons (CC0 SVG paths), imported per icon so only these ship.
 * Used to identify technologies on a personal portfolio; trademarks belong to their owners.
 */
import {
  siAmazonwebservices,
  siAnsible,
  siAnthropic,
  siApache,
  siApple,
  siApachekafka,
  siClaude,
  siCplusplus,
  siDjango,
  siDocker,
  siDuckdb,
  siExpress,
  siFastapi,
  siFastify,
  siFfmpeg,
  siGithub,
  siGithubactions,
  siGo,
  siGooglecloud,
  siGrafana,
  siHuggingface,
  siJavascript,
  siJenkins,
  siKubernetes,
  siLangchain,
  siModal,
  siMongodb,
  siNetflix,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
  siNvidia,
  siOpenai,
  siOpentelemetry,
  siPolars,
  siPostgresql,
  siPrisma,
  siPrometheus,
  siPython,
  siPytorch,
  siReact,
  siRedis,
  siSocketdotio,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTensorflow,
  siTerraform,
  siThreedotjs,
  siTwilio,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";

// AWS's official mark is near-black; its familiar orange reads better on both themes
const aws: SimpleIcon = { ...siAmazonwebservices, hex: "FF9900" };

const BY_KEY: Record<string, SimpleIcon> = {
  pytorch: siPytorch,
  cuda: siNvidia,
  nvidia: siNvidia,
  python: siPython,
  "c++": siCplusplus,
  go: siGo,
  typescript: siTypescript,
  javascript: siJavascript,
  react: siReact,
  "next.js": siNextdotjs,
  "tailwind css": siTailwindcss,
  "three.js": siThreedotjs,
  fastapi: siFastapi,
  docker: siDocker,
  kubernetes: siKubernetes,
  eks: siKubernetes,
  terraform: siTerraform,
  ansible: siAnsible,
  aws,
  s3: aws,
  gcp: siGooglecloud,
  postgres: siPostgresql,
  postgresql: siPostgresql,
  mongodb: siMongodb,
  redis: siRedis,
  kafka: siApachekafka,
  duckdb: siDuckdb,
  polars: siPolars,
  numpy: siNumpy,
  langgraph: siLangchain,
  langchain: siLangchain,
  claude: siClaude,
  anthropic: siAnthropic,
  openai: siOpenai,
  "github actions": siGithubactions,
  github: siGithub,
  grafana: siGrafana,
  prometheus: siPrometheus,
  opentelemetry: siOpentelemetry,
  vercel: siVercel,
  django: siDjango,
  "node.js": siNodedotjs,
  tensorflow: siTensorflow,
  supabase: siSupabase,
  prisma: siPrisma,
  stripe: siStripe,
  twilio: siTwilio,
  jenkins: siJenkins,
  "hugging face": siHuggingface,
  "apache tvm": siApache,
  express: siExpress,
  fastify: siFastify,
  "socket.io": siSocketdotio,
  modal: siModal,
  ffmpeg: siFfmpeg,
  mlx: siApple,
  omlx: siApple,
  "apple neural engine": siApple,
  metal: siApple,
  videotoolbox: siApple,
  netflix: siNetflix,
};

/** Normalizes labels like "React 19", "Claude API", "AWS EC2", "NVIDIA B200", "C++17". */
export function iconFor(name: string): SimpleIcon | undefined {
  const n = name.toLowerCase().trim();
  if (BY_KEY[n]) return BY_KEY[n];
  const stripped = n
    .replace(/\s+(api|sdk|tirx)$/, "")
    .replace(/\s+\d+(\.\d+)?$/, "")
    .replace(/^c\+\+\d+$/, "c++");
  if (BY_KEY[stripped]) return BY_KEY[stripped];
  const first = n.split(/\s+/)[0];
  if (["aws", "nvidia", "apple"].includes(first)) return BY_KEY[first];
  if (n.startsWith("django")) return siDjango;
  return undefined;
}

function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mix(hex: string, target: number, amount: number) {
  return (
    "#" +
    [0, 2, 4]
      .map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16);
        return Math.round(c + (target - c) * amount)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

/** Brand color adjusted so the mark keeps ≥ 3:1 contrast on the current theme's background. */
export function brandColor(icon: SimpleIcon, isDark: boolean) {
  const hex = icon.hex;
  const L = luminance(hex);
  if (isDark && L < 0.1) return L < 0.02 ? "#F4F5F9" : mix(hex, 255, 0.55);
  if (!isDark && L > 0.45) return mix(hex, 0, 0.45);
  return `#${hex}`;
}
