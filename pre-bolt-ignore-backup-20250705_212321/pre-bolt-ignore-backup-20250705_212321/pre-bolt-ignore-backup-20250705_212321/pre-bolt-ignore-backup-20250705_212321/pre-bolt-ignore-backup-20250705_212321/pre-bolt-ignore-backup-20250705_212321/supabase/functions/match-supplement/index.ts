import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fields =
      "id, name, goal, mechanism, dosage, evidence_summary, source_link";
    const results: any[] = [];

    const { data: goalMatches } = await supabase
      .from("supplements")
      .select(fields)
      .ilike("goal", `%${query}%`)
      .limit(3);

    if (goalMatches) results.push(...goalMatches);

    if (results.length < 3) {
      const { data: mechMatches } = await supabase
        .from("supplements")
        .select(fields)
        .ilike("mechanism", `%${query}%`)
        .not("id", "in", `(${results.map((r) => r.id).join(",") || "null"})`)
        .limit(3 - results.length);
      if (mechMatches) results.push(...mechMatches);
    }

    if (results.length < 3) {
      const { data: summaryMatches } = await supabase
        .from("supplements")
        .select(fields)
        .ilike("evidence_summary", `%${query}%`)
        .not("id", "in", `(${results.map((r) => r.id).join(",") || "null"})`)
        .limit(3 - results.length);
      if (summaryMatches) results.push(...summaryMatches);
    }

    return new Response(JSON.stringify({ results: results.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("match_supplement error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to match supplements" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
