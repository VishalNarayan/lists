import Twilio from "twilio";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecret"; // Store in .env.local

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Missing parameters" });

  const client = Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status === "approved") {
      const token = jwt.sign({ phone }, SECRET_KEY, { expiresIn: "365d" });
      res.json({ success: true, token });
    } else {
      res.status(400).json({ error: "Invalid code" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
