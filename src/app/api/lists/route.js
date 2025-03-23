import { getPhoneNumberFromCookies } from "@/utils/cookie-parsing";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// Get all lists
export async function GET(request) {
    console.log("Inside GET /api/lists");
    const phone = getPhoneNumberFromCookies(request.cookies);

    if (!phone) return NextResponse.json({ success: false, error: "Unable to find phone number.", status: 500 });

    const { data, error } = await supabase.from("lists").select("*").eq("user_phone", phone);
    if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
    return NextResponse.json({ success: true, lists: data || [] });
}

// Add a list
export async function POST(request) {
    console.log("Inside POST /api/lists");
    const body = await request.json();
    const { name } = body;
    const phone = getPhoneNumberFromCookies(request.cookies);
    const { data, error } = await supabase.from("lists").insert([{ user_phone: phone, name }]);
    if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
    return NextResponse.json({ success: true, list: data });
}

// Delete a list
export async function DELETE(request) {
    console.log("Inside DELETE /api/lists");
    const params = request.nextUrl.searchParams;
    const id = params.get('id');
    const { error } = await supabase.from("lists").delete().eq("id", id);
    if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
    return NextResponse.json({ success: true });
}