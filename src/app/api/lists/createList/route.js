import {getPhoneNumberFromCookies} from '@/utils/cookie-parsing';
import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// Add a list
export async function POST(request) {
    console.log("Inside POST /api/lists/createList");
    const body = await request.json();
    const { list } = body;
    const phone = getPhoneNumberFromCookies(request.cookies);

    const to_save = JSON.stringify(list);

    const { data, error } = await supabase.from("lists").insert([{ id: list.list_metadata.list_id, user_phone: phone, name: list.list_name, main_list: to_save }]);
    if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
    return NextResponse.json({ success: true, list: data });
}