import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all items for a list
export async function GET(request) {
  console.log("Inside GET /api/items");
  const params = request.nextUrl.searchParams
  const listId = params.get('listId');
  const { data, error } = await supabase.from("items").select("*").eq("list_id", listId);
  if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
  return NextResponse.json({ success: true, items: data });
}

// Add an item to a list
export async function POST(request) {
  console.log("Inside POST /api/items");
  const body = await request.json();
  const { listId, text } = body;
  const { data, error } = await supabase.from("items").insert([{ list_id: listId, text }]).select();
  if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
  return NextResponse.json({ success: true, item: data[0] });
}

// Delete an item
export async function DELETE(request) {
  console.log("Inside DELETE /api/items");
  const params = request.nextUrl.searchParams;
  const id = params.get('id');
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
  return NextResponse.json({ success: true });
}

// Toggle item checked status
export async function PUT(request) {
  console.log("Inside PUT /api/items");
  const body = await request.json();
  const { id, checked } = body;
  const { data, error } = await supabase
    .from("items")
    .update({ checked })
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ success: false, error: error.message, status: 500 });
  return NextResponse.json({ success: true, item: data[0] });
}