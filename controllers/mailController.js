import { sendEmail } from "../utils/sendEmail.js";

export const sendTestMail = async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail(
      email,
      "Welcome to ERP",
      `
        <h2>Hello 👋</h2>
        <p>Your email has been sent successfully using Nodemailer.</p>
      `
    );

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