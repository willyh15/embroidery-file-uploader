import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, fileUrl, expiryDate } = req.body;

  if (!email || !fileUrl || !expiryDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: email,
      subject: "File Expiry Notification",
      html: `<p>Your file <a href="${fileUrl}">${fileUrl}</a> will expire on ${expiryDate}. Please download it if needed.</p>`,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send email", details: error.message });
  }
}
