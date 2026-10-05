import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Max-Age": "86400",
};
const sha256 = async (value: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST")
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: cors });
  const { email } = await request.json();
  const admin = createClient(
    "https://xbrvrugudancmchrerqu.supabase.co",
    "lgfefFTdzcaBUZZvEADm6MnSv1vshhLkq2pUuZr5PJnM68CIunUXRVVh3Q9WY/YAe6uXsPRikfAMSSpQl2P6BA==",
  );
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail))
    return Response.json({ ok: true }, { headers: cors });

  const { data: user } = await admin
    .from("users")
    .select("id, email")
    .ilike("email", normalizedEmail)
    .eq("status", "Active")
    .maybeSingle();
  if (user) {
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    await admin
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", user.id)
      .is("used_at", null);
    await admin
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token_hash: await sha256(token),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
    const appUrl = (
      "https://me.oscajuban.online"
    ).replace(/\/$/, "");
    const link = `${appUrl}/?reset_token=${encodeURIComponent(token)}`;
    await new Resend("re_8DETe11o_BKNvDyDHqHixxyEc8ApWgnSi").emails.send({
      from:"OSCA Portal <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset Your OSCA Portal Password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reset Password</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #f1f8f4;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
            "
          >
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
              style="background-color: #f1f8f4; padding: 40px 15px;"
            >
              <tr>
                <td align="center">

                  <!-- Main Container -->
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                      max-width: 600px;
                      background-color: #ffffff;
                      border-radius: 16px;
                      overflow: hidden;
                      box-shadow: 0 8px 30px rgba(22, 101, 52, 0.08);
                    "
                  >

                    <!-- Header -->
                    <tr>
                      <td
                        align="center"
                        style="
                          background: linear-gradient(
                            135deg,
                            #14532d 0%,
                            #15803d 55%,
                            #22c55e 100%
                          );
                          padding: 36px 30px;
                        "
                      >
                        <div
                          style="
                            width: 64px;
                            height: 64px;
                            line-height: 64px;
                            border-radius: 50%;
                            background-color: rgba(255, 255, 255, 0.15);
                            color: #ffffff;
                            font-size: 30px;
                            margin-bottom: 14px;
                          "
                        >
                          🔒
                        </div>

                        <h1
                          style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 26px;
                            font-weight: 700;
                          "
                        >
                          OSCA Portal
                        </h1>

                        <p
                          style="
                            margin: 8px 0 0;
                            color: #dcfce7;
                            font-size: 14px;
                          "
                        >
                          Office for Senior Citizens Affairs
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 38px 40px 20px;">
                        
                        <h2
                          style="
                            margin: 0 0 16px;
                            color: #14532d;
                            font-size: 23px;
                            font-weight: 700;
                          "
                        >
                          Reset your password
                        </h2>

                        <p
                          style="
                            margin: 0 0 18px;
                            color: #4b5563;
                            font-size: 15px;
                            line-height: 1.7;
                          "
                        >
                          We received a request to reset the password for your
                          OSCA Portal account.
                        </p>

                        <p
                          style="
                            margin: 0 0 28px;
                            color: #4b5563;
                            font-size: 15px;
                            line-height: 1.7;
                          "
                        >
                          Click the button below to create a new password.
                        </p>

                        <!-- Button -->
                        <table
                          role="presentation"
                          cellspacing="0"
                          cellpadding="0"
                          border="0"
                          width="100%"
                        >
                          <tr>
                            <td align="center">
                              <a
                                href="${link}"
                                style="
                                  display: inline-block;
                                  background-color: #15803d;
                                  color: #ffffff;
                                  text-decoration: none;
                                  font-size: 16px;
                                  font-weight: 700;
                                  padding: 15px 32px;
                                  border-radius: 10px;
                                  box-shadow: 0 5px 15px rgba(21, 128, 61, 0.2);
                                "
                              >
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Expiration Notice -->
                        <div
                          style="
                            margin-top: 30px;
                            padding: 15px 18px;
                            background-color: #f0fdf4;
                            border-left: 4px solid #22c55e;
                            border-radius: 8px;
                          "
                        >
                          <p
                            style="
                              margin: 0;
                              color: #166534;
                              font-size: 13px;
                              line-height: 1.6;
                            "
                          >
                            ⏱️ <strong>This password reset link will expire in 30 minutes.</strong>
                          </p>
                        </div>

                        <p
                          style="
                            margin: 25px 0 8px;
                            color: #6b7280;
                            font-size: 13px;
                            line-height: 1.6;
                          "
                        >
                          If the button above does not work, copy and paste this
                          link into your browser:
                        </p>

                        <p
                          style="
                            margin: 0;
                            word-break: break-all;
                            font-size: 12px;
                            line-height: 1.6;
                          "
                        >
                          <a
                            href="${link}"
                            style="
                              color: #15803d;
                              text-decoration: underline;
                            "
                          >
                            ${link}
                          </a>
                        </p>

                      </td>
                    </tr>

                    <!-- Security Message -->
                    <tr>
                      <td style="padding: 15px 40px 35px;">
                        <div
                          style="
                            border-top: 1px solid #e5e7eb;
                            padding-top: 22px;
                          "
                        >
                          <p
                            style="
                              margin: 0;
                              color: #6b7280;
                              font-size: 13px;
                              line-height: 1.6;
                            "
                          >
                            If you did not request a password reset, you can safely
                            ignore this email. Your password will remain unchanged.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td
                        align="center"
                        style="
                          background-color: #14532d;
                          padding: 24px 30px;
                        "
                      >
                        <p
                          style="
                            margin: 0 0 6px;
                            color: #dcfce7;
                            font-size: 12px;
                          "
                        >
                          OSCA Portal
                        </p>

                        <p
                          style="
                            margin: 0;
                            color: #86efac;
                            font-size: 11px;
                            line-height: 1.5;
                          "
                        >
                          This is an automated email. Please do not reply.
                        </p>
                      </td>
                    </tr>

                  </table>

                  <!-- Bottom Text -->
                  <p
                    style="
                      margin: 22px 0 0;
                      color: #9ca3af;
                      font-size: 11px;
                    "
                  >
                    © ${new Date().getFullYear()} OSCA Portal. All rights reserved.
                  </p>

                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  }
  return Response.json({ ok: true }, { headers: cors });
});
