import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:info@redsoyu.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
) {
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify(payload)
    );
  } catch {
    // Subscription expirée ou invalide — ignorée silencieusement
  }
}
