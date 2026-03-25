import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailAlert {
  dustbinId: string;
  location: string;
  fillLevel: number;
  latitude: number;
  longitude: number;
}

export const sendMunicipalAlert = async (alertData: EmailAlert) => {
  const { dustbinId, location, fillLevel, latitude, longitude } = alertData;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .details { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Smart Dustbin Critical Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>⚠️ Critical Fill Level Detected</h2>
              <p>Dustbin <strong>${dustbinId}</strong> at <strong>${location}</strong> has reached <strong>${fillLevel}%</strong> capacity.</p>
            </div>
            <div class="details">
              <h3>📋 Details</h3>
              <p><strong>Dustbin ID:</strong> ${dustbinId}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Fill Level:</strong> ${fillLevel}%</p>
              <p><strong>Coordinates:</strong> ${latitude}, ${longitude}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString("en-IN")}</p>
            </div>
            <a href="https://www.google.com/maps?q=${latitude},${longitude}" class="button">
              📍 View Location
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [process.env.MUNICIPAL_EMAIL || "chotadon13123@gmail.com"],
      subject: `🚨 URGENT: Dustbin ${dustbinId} Critical Alert - ${location}`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully via Resend:", JSON.stringify(data));
    return { success: true, data };
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("❌ Resend email error:", errMsg);
    console.error("❌ Full error object:", error);
    return { success: false, error: errMsg };
  }
};
