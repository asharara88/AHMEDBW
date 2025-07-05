# Customizing Supabase Auth

Supabase Auth provides basic email based registration and login out of the box. You can extend its behavior using either Postgres functions or HTTP endpoints. These techniques let you add extra logic during signup or whenever a user logs in.

## Using Postgres Functions

Postgres functions allow you to run custom SQL whenever a user is created. In this project, the `create_profile_for_new_user` function automatically adds a row to the `profiles` table each time a new user signs up. The trigger on `auth.users` calls this function after every insert.

```sql
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the email from the new user record
  user_email := NEW.email;
  
  -- Insert profile with proper error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      last_name,
      avatar_url,
      is_admin,
      onboarding_completed,
      mobile,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      NULL,
      NULL,
      NULL,
      FALSE,
      FALSE,
      NULL,
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;
CREATE TRIGGER create_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_new_user();
```

With this function in place, each new user automatically gets a profile record. You can modify the trigger logic to perform other tasks—such as sending a welcome email or logging analytics data—by adding more SQL inside the function.

## Using HTTP Endpoints

Supabase also supports Auth Webhooks. You can configure an Edge Function to receive events when users sign up. This lets you integrate with external services or run custom code outside the database.

Example `supabase/functions/auth-webhook/index.ts`:

```ts
import { createClient } from "npm:@supabase/supabase-js";

Deno.serve(async (req) => {
  const payload = await req.json();

  // Access the user data from the webhook
  const { id, email } = payload.record;

  // Example: store an onboarding flag in the profiles table
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
```

Deploy this function with `supabase functions deploy auth-webhook` and set it as an Auth Webhook in your project settings. Every signup will trigger the HTTP endpoint.

---

Both approaches can be combined. Postgres functions are best for quick, secure database updates, while HTTP endpoints are handy for external integrations.