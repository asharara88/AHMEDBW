import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import Stripe from "npm:stripe@14.3.0";

// This is a secure handler for Stripe webhook events
Deno.serve(async (req) => {
  try {
    // Get API keys from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      console.error("Missing Stripe signature");
      return new Response(
        JSON.stringify({ error: "Missing Stripe signature" }),
        { status: 400 }
      );
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${error.message}` }),
        { status: 400 }
      );
    }

    // Log the webhook event
    await supabase.from("stripe_webhooks").insert({
      webhook_id: event.id,
      event_type: event.type,
      payload: event.data.object,
    });

    // Process the event based on its type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session, supabase, stripe);
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription, supabase, stripe);
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
});

// Helper functions for handling different webhook events

async function handleCheckoutSessionCompleted(
  session: any,
  supabase: any,
  stripe: Stripe
) {
  // Extract customer and subscription information
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  
  if (!customerId || !subscriptionId) {
    console.log("Missing customer or subscription ID in checkout session");
    return;
  }
  
  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Find the user associated with this customer
  const { data: customerData } = await supabase
    .from("stripe_customers")
    .select("user_id")
    .eq("customer_id", customerId)
    .maybeSingle();
  
  if (!customerData) {
    console.log(`No user found for Stripe customer ${customerId}`);
    return;
  }
  
  // Update subscription information in the database
  await updateSubscriptionInDatabase(subscription, supabase);
}

async function handleSubscriptionUpdated(
  subscription: any,
  supabase: any,
  stripe: Stripe
) {
  // Update subscription details in the database
  await updateSubscriptionInDatabase(subscription, supabase);
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  // Mark the subscription as cancelled in the database
  const customerId = subscription.customer;
  
  await supabase
    .from("stripe_subscriptions")
    .update({
      status: "canceled",
      deleted_at: new Date().toISOString(),
    })
    .eq("customer_id", customerId);
}

async function updateSubscriptionInDatabase(subscription: any, supabase: any) {
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0]?.price.id;
  
  // Update or insert subscription data
  await supabase
    .from("stripe_subscriptions")
    .upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: priceId,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      { onConflict: "customer_id" }
    );
}