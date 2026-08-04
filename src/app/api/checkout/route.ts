import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getBeatById } from "@/lib/beats-repo";
import { getLicenseTier, priceForLicense } from "@/lib/licensing";
import { SITE_URL } from "@/lib/constants";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        beatId: z.string().min(1),
        licenseId: z.enum(["mp3", "wav", "unlimited", "exclusive"]),
      })
    )
    .min(1, "Your cart is empty."),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload." }, { status: 400 });
  }

  try {
    const lineItems = await Promise.all(
      parsed.data.items.map(async (item) => {
        const beat = await getBeatById(item.beatId);
        if (!beat) {
          throw new Error(`Beat not found: ${item.beatId}`);
        }
        if (!beat.licenseAvailability.includes(item.licenseId)) {
          throw new Error(`"${item.licenseId}" license is not available for "${beat.title}".`);
        }
        const tier = getLicenseTier(item.licenseId);
        const price = priceForLicense(item.licenseId);

        return {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: `${beat.title} — ${tier?.name ?? item.licenseId.toUpperCase()}`,
              images: beat.artworkUrl.startsWith("https://") ? [beat.artworkUrl] : undefined,
              metadata: {
                beatId: beat.id,
                beatTitle: beat.title,
                licenseId: item.licenseId,
                licenseName: tier?.name ?? item.licenseId,
              },
            },
          },
        };
      })
    );

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "paypal"],
      line_items: lineItems,
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout`,
      invoice_creation: { enabled: true },
      // The licence agreements name the Licensee's address on their first
      // line, so it has to be captured at purchase — there is no later
      // opportunity to ask.
      billing_address_collection: "required",
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] failed to create session", error);
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
