import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StudentProfile {
  id: string;
  name: string;
  skills: string[];
  professional_summary: string;
  education: any[];
  employment_history: any[];
  contact_email: string;
  contact_phone: string;
  media_links: Record<string, string>;
  address: string;
}

interface Opportunity {
  id: string;
  role: string;
  description: string;
  skills_required: string;
  type: string;
  org_id: string;
  work_mode: string;
}

interface Match {
  opportunity_id: string;
  student_id: string;
  match_score: number;
  matched_skills: string[];
  reasoning: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "studentId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const headers = {
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    const studentResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${studentId}`,
      {
        method: "GET",
        headers,
      }
    );

    const students = await studentResponse.json();
    if (!students || students.length === 0) {
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const student: StudentProfile = students[0];

    const checkProfile = [
      !!student.skills && Array.isArray(student.skills) && student.skills.length > 0,
      !!student.professional_summary && student.professional_summary.length > 0,
      !!student.education && (Array.isArray(student.education) ? student.education.length > 0 : false),
      !!student.contact_email,
      !!student.contact_phone,
      !!student.address,
    ];

    const completionPercentage = (checkProfile.filter(Boolean).length / checkProfile.length) * 100;

    if (completionPercentage < 50) {
      return new Response(
        JSON.stringify({
          error: "Profile incomplete",
          message: "Please complete at least 50% of your profile to run matching analysis",
          completionPercentage: Math.round(completionPercentage),
          requiredFields: {
            skills: !checkProfile[0],
            professionalSummary: !checkProfile[1],
            education: !checkProfile[2],
            contactEmail: !checkProfile[3],
            contactPhone: !checkProfile[4],
            address: !checkProfile[5],
          },
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const opportunitiesResponse = await fetch(
      `${supabaseUrl}/rest/v1/opportunities?select=*`,
      {
        method: "GET",
        headers,
      }
    );

    const opportunities: Opportunity[] = await opportunitiesResponse.json();

    const matches: Match[] = [];
    const studentSkills = (student.skills || []).map((s: string) => s.toLowerCase().trim());

    for (const opp of opportunities) {
      const oppSkills = opp.skills_required
        ? opp.skills_required.split(",").map((s) => s.toLowerCase().trim())
        : [];

      const matchedSkills = studentSkills.filter((skill) =>
        oppSkills.some((oppSkill) => oppSkill.includes(skill) || skill.includes(oppSkill))
      );

      const skillMatchRatio = oppSkills.length > 0 ? matchedSkills.length / oppSkills.length : 0;

      const educationScore = student.education && student.education.length > 0 ? 20 : 0;
      const employmentScore = student.employment_history && student.employment_history.length > 0 ? 15 : 0;
      const summaryScore = student.professional_summary && student.professional_summary.length > 50 ? 15 : 0;

      const matchScore = Math.round((skillMatchRatio * 50 + educationScore + employmentScore + summaryScore));

      if (matchScore >= 40) {
        matches.push({
          opportunity_id: opp.id,
          student_id: studentId,
          match_score: matchScore,
          matched_skills: matchedSkills,
          reasoning: `Matched ${matchedSkills.length} of ${oppSkills.length} required skills for ${opp.role}`,
        });
      }
    }

    matches.sort((a, b) => b.match_score - a.match_score);

    const topMatches = matches.slice(0, 10);

    const matchesInsertResponse = await fetch(
      `${supabaseUrl}/rest/v1/student_matches`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(
          topMatches.map((match) => ({
            ...match,
            analyzed_at: new Date().toISOString(),
          }))
        ),
      }
    );

    if (!matchesInsertResponse.ok) {
      console.error("Failed to insert matches:", await matchesInsertResponse.text());
    }

    return new Response(
      JSON.stringify({
        success: true,
        completionPercentage: Math.round(completionPercentage),
        totalMatches: matches.length,
        topMatches: topMatches,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
