import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "PilotMedia <info@redsoyu.com>";

function testModeBanner(originalTo: string) {
  return `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #92400e;">
      ⚠️ <strong>MODE TEST</strong> — Cet email était destiné à : <strong>${originalTo}</strong>
    </div>
  `;
}

export async function sendPlanCreatedEmail({
  to,
  clientNom,
  canal,
  budget,
  dateDebut,
  dateFin,
  testMode,
  testEmail,
}: {
  to: string;
  clientNom: string;
  canal: string;
  budget: number;
  dateDebut: string;
  dateFin: string;
  testMode?: boolean;
  testEmail?: string;
}) {
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k F CFP` : `${n} F CFP`;
  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const recipient = testMode && testEmail ? testEmail : to;
  const banner = testMode && testEmail ? testModeBanner(to) : "";

  await resend.emails.send({
    from: FROM,
    to: recipient,
    subject: testMode ? `[TEST] Nouveau plan média ${canal} — ${clientNom}` : `Nouveau plan média ${canal} — ${clientNom}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f6fa; padding: 32px;">
        <div style="background: #1a1a2e; padding: 20px 28px; border-radius: 10px 10px 0 0;">
          <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 1px;">PilotMedia</span>
          <span style="font-size: 10px; color: #7b9fff; letter-spacing: 2px; margin-left: 10px;">PORTAIL CLIENT</span>
        </div>
        <div style="background: #fff; padding: 28px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          ${banner}
          <h2 style="font-size: 18px; color: #1a1a2e; margin: 0 0 8px;">Nouveau plan média créé</h2>
          <p style="color: #888; font-size: 14px; margin: 0 0 24px;">Bonjour, un nouveau plan média a été planifié pour votre compte.</p>

          <div style="background: #f5f6fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr><td style="color: #888; padding: 6px 0;">Canal</td><td style="font-weight: 600; color: #1a1a2e; text-align: right;">${canal}</td></tr>
              <tr><td style="color: #888; padding: 6px 0;">Budget</td><td style="font-weight: 600; color: #1a1a2e; text-align: right;">${fmt(budget)}</td></tr>
              <tr><td style="color: #888; padding: 6px 0;">Début</td><td style="font-weight: 600; color: #1a1a2e; text-align: right;">${fmtDate(dateDebut)}</td></tr>
              <tr><td style="color: #888; padding: 6px 0;">Fin</td><td style="font-weight: 600; color: #1a1a2e; text-align: right;">${fmtDate(dateFin)}</td></tr>
            </table>
          </div>

          <a href="https://mana-media-app.vercel.app/portal" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none;">
            Voir mon portail →
          </a>

          <p style="font-size: 12px; color: #aaa; margin-top: 24px; margin-bottom: 0;">
            PilotMedia · Régie publicitaire RESOYU · Polynésie française<br>
            <a href="mailto:info@redsoyu.com" style="color: #7b9fff;">info@redsoyu.com</a> · (+689) 40 85 60 72
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPlanUpdatedEmail({
  to,
  clientNom,
  canal,
  changes,
  testMode,
  testEmail,
}: {
  to: string;
  clientNom: string;
  canal: string;
  changes: string;
  testMode?: boolean;
  testEmail?: string;
}) {
  const recipient = testMode && testEmail ? testEmail : to;
  const banner = testMode && testEmail ? testModeBanner(to) : "";

  await resend.emails.send({
    from: FROM,
    to: recipient,
    subject: testMode ? `[TEST] Mise à jour de votre plan média ${canal} — ${clientNom}` : `Mise à jour de votre plan média ${canal} — ${clientNom}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f6fa; padding: 32px;">
        <div style="background: #1a1a2e; padding: 20px 28px; border-radius: 10px 10px 0 0;">
          <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 1px;">PilotMedia</span>
          <span style="font-size: 10px; color: #7b9fff; letter-spacing: 2px; margin-left: 10px;">PORTAIL CLIENT</span>
        </div>
        <div style="background: #fff; padding: 28px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          ${banner}
          <h2 style="font-size: 18px; color: #1a1a2e; margin: 0 0 8px;">Plan média modifié</h2>
          <p style="color: #888; font-size: 14px; margin: 0 0 24px;">Votre plan média <strong>${canal}</strong> a été mis à jour.</p>

          <div style="background: #f5f6fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 12px; color: #888; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Modifications</p>
            <p style="font-size: 13px; color: #1a1a2e; margin: 0; line-height: 1.8;">${changes.split(" · ").join("<br>")}</p>
          </div>

          <a href="https://mana-media-app.vercel.app/portal" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none;">
            Voir mon portail →
          </a>

          <p style="font-size: 12px; color: #aaa; margin-top: 24px; margin-bottom: 0;">
            PilotMedia · Régie publicitaire RESOYU · Polynésie française<br>
            <a href="mailto:info@redsoyu.com" style="color: #7b9fff;">info@redsoyu.com</a> · (+689) 40 85 60 72
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPlanStatusEmail({
  to,
  clientNom,
  canal,
  statut,
  testMode,
  testEmail,
}: {
  to: string;
  clientNom: string;
  canal: string;
  statut: string;
  testMode?: boolean;
  testEmail?: string;
}) {
  const messages: Record<string, { subject: string; body: string }> = {
    "En cours": {
      subject: `Votre campagne ${canal} est lancée ! — ${clientNom}`,
      body: `Bonne nouvelle ! Votre campagne <strong>${canal}</strong> est maintenant <strong>en cours</strong>.`,
    },
    "Terminé": {
      subject: `Votre campagne ${canal} est terminée — ${clientNom}`,
      body: `Votre campagne <strong>${canal}</strong> est arrivée à son terme. Consultez votre portail pour le bilan.`,
    },
  };

  const msg = messages[statut];
  if (!msg) return;

  const recipient = testMode && testEmail ? testEmail : to;
  const banner = testMode && testEmail ? testModeBanner(to) : "";

  await resend.emails.send({
    from: FROM,
    to: recipient,
    subject: testMode ? `[TEST] ${msg.subject}` : msg.subject,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f5f6fa; padding: 32px;">
        <div style="background: #1a1a2e; padding: 20px 28px; border-radius: 10px 10px 0 0;">
          <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 1px;">PilotMedia</span>
          <span style="font-size: 10px; color: #7b9fff; letter-spacing: 2px; margin-left: 10px;">PORTAIL CLIENT</span>
        </div>
        <div style="background: #fff; padding: 28px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          ${banner}
          <h2 style="font-size: 18px; color: #1a1a2e; margin: 0 0 8px;">Mise à jour de votre campagne</h2>
          <p style="color: #555; font-size: 14px; margin: 0 0 24px;">${msg.body}</p>

          <a href="https://mana-media-app.vercel.app/portal" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none;">
            Voir mon portail →
          </a>

          <p style="font-size: 12px; color: #aaa; margin-top: 24px; margin-bottom: 0;">
            PilotMedia · Régie publicitaire RESOYU · Polynésie française<br>
            <a href="mailto:info@redsoyu.com" style="color: #7b9fff;">info@redsoyu.com</a> · (+689) 40 85 60 72
          </p>
        </div>
      </div>
    `,
  });
}
