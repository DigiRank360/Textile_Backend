import { sendEmail } from "../utils/sendEmail.js";

export const sendTestMail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await sendEmail({
      to: email,
      subject: "Welcome to ERP",
      html: `
        <h2>Hello 👋</h2>
        <p>Your email has been sent successfully using Resend.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};