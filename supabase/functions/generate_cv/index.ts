import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  professional_summary?: string;
  bio?: string;
  skills_detailed?: Array<{
    name: string;
    proficiency?: string;
    years_of_experience?: number;
    description?: string;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    field_of_study?: string;
    graduation_year?: number;
  }>;
  employment_history?: Array<{
    job_title?: string;
    company_name?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  media_links?: Record<string, string>;
  languages?: string[];
  certifications?: Array<{ title: string; issuer?: string; year?: number }>;
  projects?: Array<{ title: string; description?: string; link?: string }>;
  interests?: string[];
}

interface CVContent {
  summary: string;
  highlights: string[];
  keyStrengths: string[];
}

function generateProfessionalSummary(profile: StudentProfile): CVContent {
  const skills =
    profile.skills_detailed?.map((s) => s.name).slice(0, 5) || [];
  const education = profile.education?.[0];
  const topRoles = profile.interests?.slice(0, 3) || [];
  const hasExperience =
    profile.employment_history && profile.employment_history.length > 0;

  const skillText =
    skills.length > 0
      ? `specializing in ${skills.slice(0, 3).join(", ")}`
      : "with diverse technical competencies";

  const educationText = education
    ? `${education.degree || "degree"} in ${education.field_of_study || "related field"} from ${education.institution || "leading institution"}`
    : "strong academic foundation";

  const experienceText = hasExperience
    ? "proven hands-on experience in professional environments"
    : "eager to apply academic knowledge in real-world settings";

  const summary =
    `Results-driven professional ${skillText}, holding ${educationText}. ` +
    `${experienceText}. Passionate about ${topRoles.join(", ") || "continuous learning and growth"}. ` +
    `Seeking opportunities to contribute meaningfully while developing expertise in emerging technologies and collaborative environments.`;

  const highlights = [
    skills.length > 0
      ? `Proficient in ${skills.slice(0, 4).join(", ")}`
      : "Versatile technical learner",
    education
      ? `${education.degree} graduate in ${education.field_of_study}`
      : "Continuous skill development",
    hasExperience
      ? "Hands-on experience in professional roles"
      : "Ready for real-world application",
  ];

  const keyStrengths = [
    "Problem Solving & Analytical Thinking",
    "Collaboration & Team Dynamics",
    "Adaptability & Quick Learning",
    skills[0] ? `${skills[0]} Expertise` : "Technical Proficiency",
    "Communication & Documentation",
  ];

  return { summary, highlights, keyStrengths };
}

function enhanceEducationEntries(
  education: StudentProfile["education"]
): string {
  if (!education || education.length === 0) {
    return "No formal education records provided";
  }

  return education
    .map((edu) => {
      const degree = edu.degree || "Degree";
      const institution = edu.institution || "Educational Institution";
      const field = edu.field_of_study ? ` - ${edu.field_of_study}` : "";
      const year = edu.graduation_year ? ` (${edu.graduation_year})` : "";
      return `${degree} from ${institution}${field}${year}`;
    })
    .join(" | ");
}

function enhanceSkillsPresentation(
  skills: StudentProfile["skills_detailed"]
): string {
  if (!skills || skills.length === 0) {
    return "No skills recorded";
  }

  const grouped: Record<string, string[]> = {};

  skills.forEach((skill) => {
    const level = skill.proficiency || "Intermediate";
    if (!grouped[level]) {
      grouped[level] = [];
    }
    grouped[level].push(skill.name);
  });

  return Object.entries(grouped)
    .map(([level, names]) => `${level}: ${names.join(", ")}`)
    .join(" • ");
}

function enhanceProjectDescriptions(
  projects: StudentProfile["projects"]
): Array<{ title: string; description: string }> {
  if (!projects || projects.length === 0) {
    return [];
  }

  return projects.map((project) => ({
    title: project.title,
    description:
      project.description ||
      "Developed to demonstrate technical capabilities and problem-solving approach.",
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profile } = await req.json();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Missing student profile data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cvContent = generateProfessionalSummary(profile);
    const enhancedEducation = enhanceEducationEntries(profile.education);
    const enhancedSkills = enhanceSkillsPresentation(profile.skills_detailed);
    const enhancedProjects = enhanceProjectDescriptions(profile.projects);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          summary: cvContent.summary,
          highlights: cvContent.highlights,
          keyStrengths: cvContent.keyStrengths,
          education: enhancedEducation,
          skills: enhancedSkills,
          projects: enhancedProjects,
          generatedAt: new Date().toISOString(),
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating CV:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate CV content",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
