import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET || "";
const DAYS_TO_EXPIRY = "365d"
const alg = 'HS256'

export async function POST(request) {
    console.log("Generating web token and session cookie.");

    // Verify request body input
    const body = await request.json();
    const { phone, code } = body;
    if (!phone || !code) return NextResponse.json(
        { error: "Missing parameters" }, { status: 400 });

    // Create and sign JWT
    const token = await new SignJWT({ phone })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(DAYS_TO_EXPIRY)
        .sign(new TextEncoder().encode(SECRET_KEY));

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'authToken',
        value: token,
        httpOnly: true,
        secure: true // Keep as TRUE in production environments. 
    })
    console.log("Generated web token and set cookie.");
    return NextResponse.json({ success: true, token }, { status: 200 });
}