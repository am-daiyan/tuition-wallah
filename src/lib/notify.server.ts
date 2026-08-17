/**
 * Server-only admin notification helper.
 *
 * Every important request is recorded in `admin_notifications` and, when an
 * outbound email provider is configured through environment variables, is also
 * delivered to the configured admin inbox.
 *
 * Configuration (environment variables / secrets):
 *   ADMIN_EMAIL     - destination inbox for admin notifications
 *   RESEND_API_KEY  - transactional email provider key
 *   EMAIL_FROM      - verified sender address (optional, defaults below)
 */

type NotifyInput = {
  type: string;
  subject: string;
  lines: Array<[string, string | number | null | undefined]>;
  payload?: Record<string, unknown>;
};

function renderBody(subject: string, lines: NotifyInput["lines"]): string {
  const rows = lines
    .filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  return `${subject}\n\n${rows}\n\n— Tuition Wallah`;
}

function renderHtml(subject: string, lines: NotifyInput["lines"]): string {
  const rows = lines
    .filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== "")
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#64748b;font-size:13px;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600">${escapeHtml(String(value))}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#152a5e;padding:20px 24px;color:#fff">
      <div style="font-size:12px;letter-spacing:.18em;color:#f0c040">TUITION WALLAH</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px">${escapeHtml(subject)}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;padding:24px" cellpadding="0" cellspacing="0">
      <tbody style="display:block;padding:20px 24px">${rows}</tbody>
    </table>
  </div>
</div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyAdmin(input: NotifyInput): Promise<{ status: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const recipients = (process.env["ADMIN_EMAIL"] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const recipient = recipients.join(", ") || null;
  const apiKey = process.env["RESEND_API_KEY"] ?? null;
  const from = process.env["EMAIL_FROM"] ?? "Tuition Wallah <onboarding@resend.dev>";
  const body = renderBody(input.subject, input.lines);

  let status = "recorded";
  let error: string | null = null;

  if (recipients.length > 0 && apiKey) {
    const failures: string[] = [];
    let delivered = 0;

    // Sent one recipient at a time so a single rejected address (e.g. an
    // unverified inbox in the provider's test mode) cannot block the others.
    for (const to of recipients) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [to],
            subject: `[Tuition Wallah] ${input.subject}`,
            text: body,
            html: renderHtml(input.subject, input.lines),
          }),
        });
        if (res.ok) {
          delivered += 1;
        } else {
          failures.push(`${to}: provider responded ${res.status}`);
        }
      } catch (err) {
        failures.push(`${to}: ${err instanceof Error ? err.message : "unknown email error"}`);
      }
    }

    status = delivered > 0 ? (failures.length > 0 ? "partial" : "sent") : "failed";
    error = failures.length > 0 ? failures.join("; ") : null;
  } else {
    status = "recorded";
    error = "Email delivery not configured (ADMIN_EMAIL / RESEND_API_KEY missing)";
  }

  await supabaseAdmin.from("admin_notifications").insert({
    type: input.type,
    subject: input.subject,
    body,
    payload: (input.payload ?? {}) as never,
    recipient,
    status,
    error,
  });

  return { status };
}
