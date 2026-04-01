import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createNotification } from "@/utils/createNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting en mémoire : IP → timestamps des envois
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000; // 1 heure
const MAX_REQUESTS = 3; // max 3 envois par IP par heure

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) return true;
  rateLimitMap.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(request: Request) {
  // Rate limiting par IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Trop de messages envoyés. Réessayez dans une heure." }, { status: 429 });
  }

  const { entreprise, contact_nom, email, tel, message, website } = await request.json();

  // Honeypot — si le champ "website" est rempli, c'est un bot
  if (website) {
    return NextResponse.json({ success: true }); // Fausse réussite pour ne pas alerter le bot
  }

  if (!entreprise || !email || !message) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "MANA MEDIA <info@redsoyu.com>",
    to: "info@redsoyu.com",
    replyTo: email,
    subject: `Nouveau contact — ${entreprise}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f6fa; padding: 32px;">
        <div style="background: #1a1a2e; padding: 20px 28px; border-radius: 10px 10px 0 0;">
          <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 1px;">MANA MEDIA</span>
          <span style="font-size: 10px; color: #7b9fff; letter-spacing: 2px; margin-left: 10px;">NOUVEAU CONTACT</span>
        </div>
        <div style="background: #fff; padding: 28px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="font-size: 18px; color: #1a1a2e; margin: 0 0 20px;">Nouvelle demande de contact</h2>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr><td style="color: #888; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">Entreprise</td><td style="font-weight: 600; color: #1a1a2e; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">${entreprise}</td></tr>
            ${contact_nom ? `<tr><td style="color: #888; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">Contact</td><td style="font-weight: 600; color: #1a1a2e; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">${contact_nom}</td></tr>` : ""}
            <tr><td style="color: #888; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">Email</td><td style="font-weight: 600; color: #7b9fff; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><a href="mailto:${email}" style="color: #7b9fff;">${email}</a></td></tr>
            ${tel ? `<tr><td style="color: #888; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">Téléphone</td><td style="font-weight: 600; color: #1a1a2e; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><a href="tel:${tel}" style="color: #1a1a2e;">${tel}</a></td></tr>` : ""}
          </table>
          <div style="margin-top: 20px; background: #f5f6fa; border-radius: 8px; padding: 16px;">
            <p style="font-size: 12px; color: #888; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
            <p style="font-size: 14px; color: #1a1a2e; margin: 0; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      </div>
    `,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // body encodé avec || comme séparateur pour parsing côté notifications
  const bodyParts = [email, contact_nom || "", tel || "", message.slice(0, 100)];
  await createNotification({
    type: "contact",
    title: `Nouveau contact — ${entreprise}`,
    body: bodyParts.join("||"),
  });

  return NextResponse.json({ success: true });
}
