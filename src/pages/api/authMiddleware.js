import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

export function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];// Expects Bearer <token>

    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });

        req.user = user;
        next();
    });
}

/*
Some information about usage: 

To modify any API that requires authentication, you can use the authenticateToken function as a middleware. 

Example: 

import { authenticateToken } from "./authMiddleware";

export default function handler(req, res) {
  authenticateToken(req, res, () => {
    // Now this API is protected, and req.user.phone is available
    if (req.method === "GET") {
      res.json({ success: true, message: `Authenticated as ${req.user.phone}` });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  });
}

To update the frontend to send token in requests, modify the fetch call to include the token in the Authorization header.

Example: 

const fetchLists = async () => {
  const token = localStorage.getItem("authToken");
  const res = await fetch("/api/lists", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  console.log(data);
};
*/