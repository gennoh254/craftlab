import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SkillEntry {
  id: string;
  name: string;
  description: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface StudentProfile {
  id: string;
  name: string;
  skills?: string[] | null;
  skills_detailed?: SkillEntry[] | null;
  professional_summary?: string | null;
  education?: any[] | null;
  employment_history?: any[] | null;
  contact_email?: string | null;
  contact_phone?: string | null;
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
    const { orgId } = await req.json();

    if (!orgId) {
      return new Response(
        JSON.stringify({ error: "orgId is required" }),
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
      apikey: serviceRoleKey,
    };

    const opportunitiesResponse = await fetch(
      `${supabaseUrl}/rest/v1/opportunities?org_id=eq.${orgId}&select=*`,
      {
        method: "GET",
        headers,
      }
    );

    if (!opportunitiesResponse.ok) {
      const errorText = await opportunitiesResponse.text();
      console.error("Failed to fetch opportunities:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch opportunities",
          details: errorText
        }),
        {
          status: opportunitiesResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const opportunities: Opportunity[] = await opportunitiesResponse.json();

    if (!opportunities || opportunities.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No opportunities found for this organization",
          newMatches: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const opportunityIds = opportunities.map((opp: any) => opp.id);

    const existingMatchesResponse = await fetch(
      `${supabaseUrl}/rest/v1/student_matches?opportunity_id=in.(${opportunityIds.join(',')})&select=student_id,opportunity_id`,
      {
        method: "GET",
        headers,
      }
    );

    const existingMatches = existingMatchesResponse.ok ? await existingMatchesResponse.json() : [];
    const existingMatchPairs = new Set(
      existingMatches.map((m: any) => `${m.student_id}-${m.opportunity_id}`)
    );

    const studentsResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_type=eq.STUDENT&select=*`,
      {
        method: "GET",
        headers,
      }
    );

    if (!studentsResponse.ok) {
      const errorText = await studentsResponse.text();
      console.error("Failed to fetch students:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch students",
          details: errorText
        }),
        {
          status: studentsResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const students: StudentProfile[] = await studentsResponse.json();
    const allNewMatches: Match[] = [];
    const proficiencyWeights: Record<string, number> = {
      'Expert': 1.3,
      'Advanced': 1.2,
      'Intermediate': 1.0,
      'Beginner': 0.7
    };

    for (const student of students) {
      const hasRequiredFields = (student.skills_detailed != null && Array.isArray(student.skills_detailed) && student.skills_detailed.length > 0) ||
                               (student.skills != null && Array.isArray(student.skills) && student.skills.length > 0);

      if (!hasRequiredFields) continue;

      let studentSkills: string[] = [];

      if (student.skills_detailed != null && Array.isArray(student.skills_detailed) && student.skills_detailed.length > 0) {
        studentSkills = student.skills_detailed.map((s: SkillEntry) => s?.name?.toLowerCase().trim() || '').filter(Boolean);
      } else if (student.skills != null && Array.isArray(student.skills)) {
        studentSkills = student.skills.map((s: string) => s?.toLowerCase().trim() || '').filter(Boolean);
      }

      const studentSummary = (student.professional_summary || '').toLowerCase();

      for (const opp of opportunities) {
        const matchKey = `${student.id}-${opp.id}`;

        if (existingMatchPairs.has(matchKey)) {
          continue;
        }

        const oppSkills = opp.skills_required
          ? opp.skills_required.split(",").map((s) => s.toLowerCase().trim()).filter(Boolean)
          : [];

        const oppDescription = (opp.description || '').toLowerCase();
        const oppRole = (opp.role || '').toLowerCase();
        const oppCombined = `${oppSkills.join(' ')} ${oppDescription} ${oppRole}`;

        const matchedSkills: string[] = [];
        let weightedSkillScore = 0;
        let summaryMatchBonus = 0;

        for (const studentSkill of studentSkills) {
          let isMatched = false;

          if (oppSkills.length > 0) {
            const exactSkillMatch = oppSkills.find((oppSkill) =>
              oppSkill.includes(studentSkill) || studentSkill.includes(oppSkill)
            );

            if (exactSkillMatch) {
              isMatched = true;
            }
          }

          if (!isMatched && oppCombined.includes(studentSkill)) {
            isMatched = true;
          }

          if (isMatched) {
            matchedSkills.push(studentSkill);

            if (student.skills_detailed != null && Array.isArray(student.skills_detailed)) {
              const skillDetail = student.skills_detailed.find((s: SkillEntry) =>
                s?.name?.toLowerCase().trim() === studentSkill
              );

              if (skillDetail && skillDetail.proficiency) {
                const weight = proficiencyWeights[skillDetail.proficiency] || 1.0;
                weightedSkillScore += weight;
              } else {
                weightedSkillScore += 1.0;
              }
            } else {
              weightedSkillScore += 1.0;
            }
          }
        }

        if (matchedSkills.length > 0) {
          summaryMatchBonus = 10;
        }

        const skillMatchRatio = weightedSkillScore > 0 ? Math.min(weightedSkillScore / (oppSkills.length * 1.3 > 0 ? oppSkills.length * 1.3 : 1.0), 1.0) : 0;

        let summaryContentScore = 0;
        if (studentSummary.length > 0 && oppDescription.length > 0) {
          const summaryWords = studentSummary.split(/\s+/).filter(w => w.length > 3);
          const matchedSummaryWords = summaryWords.filter(word => oppCombined.includes(word));
          if (matchedSummaryWords.length > 0) {
            summaryContentScore = Math.min((matchedSummaryWords.length / summaryWords.length) * 20, 20);
          }
        }

        const educationScore = student.education && student.education.length > 0 ? 20 : 0;
        const employmentScore = student.employment_history && student.employment_history.length > 0 ? 15 : 0;
        const basicSummaryScore = student.professional_summary && student.professional_summary.length > 50 ? 5 : 0;

        const matchScore = Math.round((skillMatchRatio * 40 + educationScore + employmentScore + basicSummaryScore + summaryContentScore + summaryMatchBonus));

        if (matchScore >= 30) {
          let reasoning = '';

          if (matchedSkills.length > 0) {
            reasoning = `Matched ${matchedSkills.length} skill${matchedSkills.length !== 1 ? 's' : ''}: ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? `, +${matchedSkills.length - 3} more` : ''}`;

            if (student.skills_detailed != null && Array.isArray(student.skills_detailed) && matchedSkills.length > 0) {
              const expertSkills = matchedSkills.filter(skill => {
                const detail = student.skills_detailed!.find((s: SkillEntry) =>
                  s?.name?.toLowerCase().trim() === skill
                );
                return detail && detail.proficiency && (detail.proficiency === 'Expert' || detail.proficiency === 'Advanced');
              });

              if (expertSkills.length > 0) {
                reasoning += `. ${expertSkills.length} advanced/expert level skill${expertSkills.length !== 1 ? 's' : ''}`;
              }
            }
          } else {
            reasoning = `Profile aligns with ${opp.role} opportunity`;
          }

          if (summaryContentScore > 5) {
            reasoning += `. Your experience matches the opportunity description`;
          }

          allNewMatches.push({
            opportunity_id: opp.id,
            student_id: student.id,
            match_score: Math.max(matchScore, 30),
            matched_skills: matchedSkills,
            reasoning: reasoning,
          });
        }
      }
    }

    allNewMatches.sort((a, b) => b.match_score - a.match_score);

    if (allNewMatches.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No new matches found",
          newMatches: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const matchesInsertResponse = await fetch(
      `${supabaseUrl}/rest/v1/student_matches`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(
          allNewMatches.map((match) => ({
            ...match,
            analyzed_at: new Date().toISOString(),
          }))
        ),
      }
    );

    if (!matchesInsertResponse.ok) {
      const errorText = await matchesInsertResponse.text();
      console.error("Failed to insert matches:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to save matches",
          details: errorText,
          matchesAttempted: allNewMatches.length,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Matching analysis completed",
        newMatches: allNewMatches.length,
        studentsAnalyzed: students.length,
        opportunitiesAnalyzed: opportunities.length,
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
