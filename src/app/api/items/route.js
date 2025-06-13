import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getPhoneNumberFromCookies } from '@/utils/cookie-parsing';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Persist items in a list
export async function POST(request) {
  console.log("Inside POST /api/items");
  const phone = getPhoneNumberFromCookies(request.cookies);
  if (!phone) return NextResponse.json({ success: false, error: "Unable to find phone number.", status: 500 });

  const body = await request.json();

  const { blob } = body;

  const to_save = JSON.stringify(blob);
  let { error } = await supabase
    .from("lists")
    .update({ main_list: to_save, name: blob.list_name })
    .eq('id', blob.list_metadata.list_id)
    .select();

  if (error) {
    console.error("Database save error:", error);
    return NextResponse.json({ success: false, error: "Failed to save list.", status: 500 });
  }

  return NextResponse.json({ success: true });

}