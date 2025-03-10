import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecret"; // Store in .env.local

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: "Missing parameters" });
    const token = jwt.sign({ phone }, SECRET_KEY, { expiresIn: "365d" });
    res.json({ success: true, token });
}