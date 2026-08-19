import transporter from "../config/mailer.js";

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const smtpUser = process.env.SMTP_USER;

    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL is missing in environment variables");
    }

    if (!smtpUser) {
      throw new Error("SMTP_USER is missing in environment variables");
    }

    const info = await transporter.sendMail({
      from: `"Eagle Incense Sticks" <${smtpUser}>`,
      to: adminEmail,
      replyTo: cleanEmail,
      subject: "New Newsletter Subscription",

      html: `
        <div style="
          max-width:600px;
          margin:0 auto;
          padding:24px;
          background:#f6f6f6;
          font-family:Arial,sans-serif;
        ">
          <div style="
            background:#ffffff;
            padding:28px;
            border-radius:10px;
            border:1px solid #eeeeee;
          ">
            <h2 style="margin-top:0;color:#222;">
              New Newsletter Subscriber
            </h2>

            <p>
              A new user has subscribed to the Eagle Incense Sticks newsletter.
            </p>

            <div style="
              margin-top:20px;
              padding:16px;
              background:#f5efe3;
              border-radius:8px;
            ">
              <strong>Email:</strong>
              ${escapeHtml(cleanEmail)}
            </div>
          </div>
        </div>
      `,
    });

    console.log("Newsletter email sent:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Newsletter error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to subscribe",
    });
  }
};