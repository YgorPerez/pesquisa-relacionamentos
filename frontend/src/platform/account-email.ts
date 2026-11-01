/** Server-only mail seam shared by password recovery and identity linking.
 * Endpoint injection is for local tests only; runtime always uses Resend. */
export async function sendAccountEmail(
  config: { apiKey: string; from: string; endpoint?: string },
  mail: { to: string; subject: string; text: string },
): Promise<boolean> {
  try {
    const response = await fetch(
      config.endpoint ?? 'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ from: config.from, ...mail }),
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      },
    )
    return response.ok
  } catch {
    // Provider errors may contain the recipient or link. Never log them.
    return false
  }
}
