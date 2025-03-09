import Twilio from "twilio";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const client = Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to: phone, channel: "sms" });

    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    console.log("Got error: " + error);
    res.status(500).json({ error: error.message });
  }
}
