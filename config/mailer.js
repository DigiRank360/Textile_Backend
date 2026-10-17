import { Resend } from "resend";

// Optional: server runs without a key, email features are simply unavailable.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export default resend;
