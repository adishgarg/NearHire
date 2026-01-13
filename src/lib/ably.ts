// Lightweight Ably helper. Safe no-op if ABLY_KEY not provided or the Ably package isn't installed.
type PublishPayload = any;

export async function publishToAbly(channelName: string, eventName: string, payload: PublishPayload) {
  const key = process.env.ABLY_KEY || process.env.NEXT_PUBLIC_ABLY_KEY;
  if (!key) return;

  try {
    // Dynamically require to avoid hard dependency during initial development.
    // The `ably` package should be added to your server dependencies when you enable Ably.
    // npm install ably
    // On serverless platforms, use the REST client to publish messages.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Ably = require('ably');
    const client = new Ably.Rest({ key });
    await client.channels.get(channelName).publish(eventName, payload);
  } catch (err) {
    // Fail silently — publishing is optional until you enable Ably.
    // Log for debugging when running locally with ABLY_KEY set.
    // eslint-disable-next-line no-console
    console.warn('Ably publish failed or not configured:', err instanceof Error ? err.message : err);
  }
}

export default publishToAbly;
