import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
  const payload = await req.json();

  const { id, email } = payload.record;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  await supabase
    .from("profiles")
    .update({ onboarding_completed: false })
    .eq("id", id);

  return new Response("ok");
});
