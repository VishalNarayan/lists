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

    const { data, error } = await supabase.from("lists").select("main_list").eq("user_phone", phone);
    if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
    return NextResponse.json({ success: true, lists: data || [] });
}

// Persist all lists
export async function POST(request) {
    console.log("Inside POST /api/lists");
    const phone = getPhoneNumberFromCookies(request.cookies);
    if (!phone) return NextResponse.json({ success: false, error: "Unable to find phone number.", status: 500 });

    const body = await request.json();

    const { blob } = body;

    blob.forEach(async (list) => {
        const to_save = JSON.stringify(list);
        const { data, error } = await supabase
            .from("lists")
            .update({ main_list: to_save })
            .eq('id', list.list_metadata.list_id)
            .select();
    })

    return NextResponse.json({ success: true });

}