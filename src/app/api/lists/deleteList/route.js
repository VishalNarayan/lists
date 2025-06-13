import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {getPhoneNumberFromCookies} from '@/utils/cookie-parsing';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// Delete a list
export async function DELETE(request) {
    console.log("Inside DELETE /api/lists/v2");

    const phone = getPhoneNumberFromCookies(request.cookies);
    if (!phone) {
        return NextResponse.json({ success: false, error: "Unable to find phone number.", status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");

    if (!listId) {
        return NextResponse.json({ success: false, error: "Missing listId in query parameters.", status: 400 });
    }

    const { error } = await supabase
        .from("lists")
        .delete()
        .eq("id", listId);

    if (error) {
        console.error("Database deletion error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete list.", status: 500 });
    }

    return NextResponse.json({ success: true });
}