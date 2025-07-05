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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    return new Response(
      JSON.stringify({ onboardingCompleted: data?.onboarding_completed ?? false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Failed to fetch onboarding status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch onboarding status" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
