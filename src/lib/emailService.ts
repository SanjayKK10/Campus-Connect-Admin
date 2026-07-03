/**
 * Dispatches an automated verification confirmation email using SendGrid's v3 Mail Send API.
 */
export async function sendVerificationEmail(email: string, name: string): Promise<void> {
  // Pull the authorization token from Vite environment variables
  const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn("SendGrid API key missing in environment configuration. Skipping email delivery.");
    return;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email, name: name }],
          },
        ],
        // ⚠️ Crucial: This 'from' email MUST exactly match a Sender Identity 
        // verified inside your SendGrid dashboard settings.
        from: { 
          email: "sanjay@rynixsoft.com", 
          name: "CampusConnect Admin Team" 
        },
        subject: "Your CampusConnect Account is Verified! 🎉",
        content: [
          {
            type: "text/html",
            value: `
              <div style="font-family: sans-serif; padding: 25px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #4f46e5;">Hello ${name},</h2>
                <p style="font-size: 16px; line-height: 1.6;">Great news! Our administration team has reviewed and verified your account profile details.</p>
                <p style="font-size: 16px; line-height: 1.6;">Your workspace soft-lock has been fully lifted. You are now cleared to log into the mobile app and explore your dashboard features immediately.</p>
                <br />
                <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
                <p style="font-size: 14px; color: #64748b; margin-top: 15px;">Best regards,<br /><strong>CampusConnect Operations Team</strong></p>
              </div>
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error("SendGrid API rejected the transfer request:", errorPayload);
    }
  } catch (error) {
    console.error("Network fault encountered while transmitting SendGrid envelope:", error);
  }
}