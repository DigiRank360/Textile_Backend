import transporter from "../config/mailer.js";


export const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
  replyTo,
}) => {
  try {
    if (!to) {
      throw new Error("Recipient email is required.");
    }

    if (!subject) {
      throw new Error("Email subject is required.");
    }

    if (!html) {
      throw new Error("Email content is required.");
    }

    const mailOptions = {
      from: {
        name: "Eagle Incense Sticks",
        address: process.env.SMTP_USER,
      },
      to,
      subject,
      html,
      text,
      ...(replyTo && { replyTo }),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent successfully: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    throw new Error(
      `Unable to send email: ${error.message}`
    );
  }
};