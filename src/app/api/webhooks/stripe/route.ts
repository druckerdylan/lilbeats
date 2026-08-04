import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { createDownloadToken } from "@/lib/download-tokens";
import { sendEmail } from "@/lib/resend";
import { orderReceiptEmail } from "@/lib/email/templates";
import { SITE_URL } from "@/lib/constants";
import { OrderItemRecord } from "@/lib/types";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe-webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  /*
    `checkout.session.completed` fires when the *session* finishes, which is
    not the same as the money arriving — PayPal and other delayed methods
    complete the session as `unpaid` and settle later via
    `async_payment_succeeded`. Fulfilling on the first event alone would hand
    over files for a payment that can still fail.
  */
  const isFulfillable =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";

  if (isFulfillable) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.info(
        `[stripe-webhook] session ${session.id} is ${session.payment_status}; waiting for payment to settle`
      );
      return NextResponse.json({ received: true, pending: true });
    }

    try {
      await fulfillOrder(stripe, session);
    } catch (error) {
      // Returning non-2xx is the only way to ask Stripe to retry. Swallowing
      // this would leave a paying customer with no files and no signal
      // anywhere that anything went wrong.
      console.error("[stripe-webhook] fulfillment failed", error);
      return NextResponse.json({ error: "Fulfillment failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function fulfillOrder(stripe: Stripe, session: Stripe.Checkout.Session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const items: OrderItemRecord[] = lineItems.data.map((line) => {
    const product = line.price?.product as Stripe.Product;
    return {
      beatId: product.metadata.beatId,
      beatTitle: product.metadata.beatTitle ?? line.description ?? "Beat",
      licenseId: product.metadata.licenseId as OrderItemRecord["licenseId"],
      licenseName: product.metadata.licenseName ?? "License",
      price: (line.amount_total ?? 0) / 100,
    };
  });

  const customerEmail = session.customer_details?.email ?? session.customer_email;
  const amountTotal = (session.amount_total ?? 0) / 100;

  if (!customerEmail) {
    console.error("[stripe-webhook] no customer email on session", session.id);
    return;
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .upsert(
        {
          stripe_session_id: session.id,
          customer_email: customerEmail,
          customer_name: session.customer_details?.name ?? null,
          amount_total: amountTotal,
          currency: session.currency ?? "usd",
          status: "paid",
        },
        { onConflict: "stripe_session_id" }
      )
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Could not record order for ${session.id}: ${orderError?.message}`);
    }

    /*
      Stripe delivers webhooks at-least-once, so the same event can arrive
      repeatedly — and because a failure part-way through now throws so Stripe
      retries, a retry can legitimately find *some* items already recorded.

      So this resumes rather than skipping wholesale: anything already stored
      is left alone, and only the missing line items are created. Checking
      merely "are there any items?" would strand a partially-fulfilled order
      forever, since the retry would see one row and return.
    */
    const { data: existingItems, error: existingError } = await supabase
      .from("order_items")
      .select("beat_id, license_id")
      .eq("order_id", order.id);

    if (existingError) {
      throw new Error(`Could not read existing order items: ${existingError.message}`);
    }

    const alreadyRecorded = new Set(
      (existingItems ?? []).map((row) => `${row.beat_id}::${row.license_id}`)
    );

    const pending = items.filter(
      (item) => !alreadyRecorded.has(`${item.beatId}::${item.licenseId}`)
    );

    // Fully fulfilled by an earlier delivery — don't re-send the receipt.
    if (pending.length === 0) {
      return;
    }

    for (const item of pending) {
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          beat_id: item.beatId,
          beat_title: item.beatTitle,
          license_id: item.licenseId,
          license_name: item.licenseName,
          price: item.price,
        })
        .select()
        .single();

      // Previously this logged and continued, then still sent a "your files
      // are ready" receipt — the customer paid, got an email, and had nothing
      // to download. Abort so Stripe retries and no receipt goes out.
      if (itemError || !orderItem) {
        throw new Error(
          `Could not record "${item.beatTitle}" (${item.licenseId}): ${itemError?.message}`
        );
      }

      await createDownloadToken({
        orderId: order.id,
        orderItemId: orderItem.id,
        beatId: item.beatId,
        licenseId: item.licenseId,
      });

      /*
        An exclusive licence transfers the beat outright, so it has to leave
        the store the moment it sells. Every catalogue read filters on
        `published`, so this both hides it and makes a second checkout fail
        at the "beat not found" guard. `getBeatFileLocation` deliberately
        does not filter on `published`, so this buyer keeps their download.
      */
      if (item.licenseId === "exclusive") {
        const { error: retireError } = await supabase
          .from("beats")
          .update({ published: false })
          .eq("id", item.beatId);

        if (retireError) {
          throw new Error(
            `Sold exclusive rights to "${item.beatTitle}" but could not retire it from the store: ${retireError.message}`
          );
        }
        console.info(`[stripe-webhook] retired beat ${item.beatId} after exclusive sale`);
      }
    }
  } else {
    console.warn(
      "[stripe-webhook] Supabase is not configured — order was not persisted. Configure Supabase to enable durable order history and secure downloads."
    );
  }

  const { subject, html } = orderReceiptEmail({
    orderId: session.id,
    customerName: session.customer_details?.name,
    items,
    amountTotal,
    downloadUrl: `${SITE_URL}/checkout/success?session_id=${session.id}`,
  });

  /*
    The receipt is the last step and deliberately cannot fail the webhook.
    By this point the order, its items and the download tokens are all
    committed — the customer already has their files via the success page.
    Throwing here would make Stripe retry an order that was fully fulfilled,
    so the failure is logged loudly instead.
  */
  try {
    await sendEmail({ to: customerEmail, subject, html });
  } catch (error) {
    console.error(
      `[stripe-webhook] ORDER FULFILLED BUT RECEIPT FAILED for ${customerEmail} (session ${session.id}) — they can still download from the success page, but follow up manually:`,
      error
    );
  }
}
