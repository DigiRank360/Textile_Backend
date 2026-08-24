import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html, replyTo }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Recipient, subject, and html content are required.");
    }

    const recipients = Array.isArray(to) ? to : [to];
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      throw new Error(error.message);
    }

    console.log(`📧 Email sent successfully! ID: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw new Error(`Unable to send email: ${error.message}`);
  }
};