import Enquiry from "../models/Enquiry.js";
import { sendEmail } from "../utils/sendEmail.js";

// HTML injection se bachne ke liye
const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

// Create Enquiry
export const createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      countryCode,
      country,
      message,
      productId,
      productName,
    } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and message are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();
    const cleanCountry = country?.trim() || "";
    const cleanCountryCode = countryCode?.trim() || "";
    const cleanProductName = productName?.trim() || "";

    const enquiry = await Enquiry.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      countryCode: cleanCountryCode,
      country: cleanCountry,
      message: cleanMessage,
      productId: productId || null,
      productName: cleanProductName,
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const isResendTestMode =
      String(process.env.RESEND_TEST_MODE || "true").toLowerCase() === "true";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is missing in environment variables");
    }

    if (!adminEmail) {
      console.warn(
        "ADMIN_EMAIL is missing in environment variables; admin email notification will be skipped.",
      );
    }

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safePhone = escapeHtml(cleanPhone);
    const safeCountryCode = escapeHtml(cleanCountryCode);
    const safeCountry = escapeHtml(cleanCountry);
    const safeMessage = escapeHtml(cleanMessage);
    const safeProductName = escapeHtml(cleanProductName);

    // Admin ke liye email HTML
    const adminHtml = `
      <div style="max-width:600px;margin:0 auto;padding:24px;background:#f6f6f6;font-family:Arial,sans-serif;">
        <div style="background:#ffffff;padding:28px;border-radius:10px;border:1px solid #eeeeee;">
          <h2 style="margin-top:0;color:#222;">
            ${safeProductName ? "New Quote Request" : "New Website Enquiry"}
          </h2>
          ${
            safeProductName
              ? `<p><strong>Product:</strong> ${safeProductName}</p>`
              : ""
          }
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safeCountryCode} ${safePhone}</p>
          ${
            safeCountry
              ? `<p><strong>Country:</strong> ${safeCountry}</p>`
              : ""
          }
          <div style="margin-top:16px;padding:16px;background:#f5efe3;border-radius:8px;">
            <strong>Message:</strong><br/>${safeMessage}
          </div>
        </div>
      </div>
    `;

    // Customer ke liye confirmation email HTML
    const customerHtml = `
      <div style="max-width:600px;margin:0 auto;padding:24px;background:#f6f6f6;font-family:Arial,sans-serif;">
        <div style="background:#ffffff;padding:28px;border-radius:10px;border:1px solid #eeeeee;">
          <h2 style="margin-top:0;color:#222;">Hi ${safeName},</h2>
          <p>
            Thank you for ${
              safeProductName ? "your quote request" : "reaching out to us"
            }. We have received your enquiry and our team will get back to you shortly.
          </p>
          ${
            safeProductName
              ? `<p><strong>Product:</strong> ${safeProductName}</p>`
              : ""
          }
          <div style="margin-top:16px;padding:16px;background:#f5efe3;border-radius:8px;">
            <strong>Your message:</strong><br/>${safeMessage}
          </div>
          <p style="margin-top:20px;">Regards,<br/>Eagle Textile Team</p>
        </div>
      </div>
    `;

    const emailTasks = [];

    // Admin notification email
    if (adminEmail && resendApiKey) {
      emailTasks.push(
        sendEmail({
          to: adminEmail,
          replyTo: cleanEmail,
          subject: cleanProductName
            ? `New Quote Request - ${cleanProductName}`
            : "New Website Enquiry",
          html: adminHtml,
        }),
      );
    }

    // Customer confirmation email
    const customerEmailAllowed =
      !isResendTestMode ||
      cleanEmail.toLowerCase() === String(adminEmail || "").toLowerCase();

    if (resendApiKey && customerEmailAllowed) {
      emailTasks.push(
        sendEmail({
          to: cleanEmail,
          replyTo: adminEmail || process.env.RESEND_FROM_EMAIL || "eaglefabrichub@gmail.com",
          subject: cleanProductName
            ? "We received your quote request"
            : "We received your enquiry",
          html: customerHtml,
        }),
      );
    } else if (isResendTestMode && cleanEmail && adminEmail) {
      console.log(
        `Resend test mode enabled: skipping customer email to ${cleanEmail} because only ${adminEmail} is allowed for testing.`,
      );
    }

    const emailResults = await Promise.allSettled(emailTasks);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Nodemailer email ${index + 1} failed:`, result.reason);
      } else {
        console.log(
          `Nodemailer email ${index + 1} sent:`,
          result.value?.messageId,
        );
      }
    });

    const emailsSentSuccessfully =
      emailTasks.length > 0 &&
      emailResults.every((result) => result.status === "fulfilled");

    return res.status(201).json({
      success: true,
      message: "Enquiry Submitted Successfully",
      emailSent: emailsSentSuccessfully,
      data: enquiry,
    });
  } catch (error) {
    console.error("Create enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to submit enquiry",
    });
  }
};

// Get All Enquiries
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    console.error("Get enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Enquiry
export const getEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error("Get enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry Deleted Successfully",
    });
  } catch (error) {
    console.error("Delete enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};