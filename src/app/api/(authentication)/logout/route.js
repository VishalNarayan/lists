import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
    console.log("Logging out.");
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    return NextResponse.json({ success: true }, { status: 200 });
}