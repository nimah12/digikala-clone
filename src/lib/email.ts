import { Resend } from "resend";

/**
 * ارسال ایمیل با سرویس Resend.
 * - اگر RESEND_API_KEY نباشد، فقط در لاگ سرور ثبت می‌شود (حالت توسعه).
 * - اگر دامنه تأییدنشده باشد (403)، خطا ثبت ولی برنامه کرش نمی‌کند.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // ماسک ایمیل در لاگ (ضد نشت اطلاعات شخصی)
    const masked = opts.to.replace(/^(.)(.+)(.@.*)$/, "$1***$3");
    console.log(`[email] (بدون کلید) ایمیل به ${masked}: ${opts.subject}`);
    return { ok: false, error: "RESEND_API_KEY تنظیم نشده است" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    `دیجی‌کلون <onboarding@resend.dev>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] Resend exception:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** escape محتوای کاربر در HTML ایمیل (ضد HTML injection از طرف کاربر) */
export function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** قالب ساده HTML برای ایمیل‌ها */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Tahoma,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e0e2">
        <tr>
          <td style="background:#ef4050;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold;text-align:center">
            دیجی‌کلون — ${title}
          </td>
        </tr>
        <tr>
          <td style="padding:24px;color:#424750;font-size:14px;line-height:2">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#f5f5f5;color:#a1a3a8;font-size:11px;text-align:center">
            این ایمیل به‌صورت خودکار از فروشگاه اینترنتی دیجی‌کلون ارسال شده است.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
