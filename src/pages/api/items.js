import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Get all items for a list
    const { listId } = req.query;
    const { data, error } = await supabase.from("items").select("*").eq("list_id", listId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, items: data });
  }

  if (req.method === "POST") {
    // Add an item to a list
    const { listId, text } = req.body;
    console.log(req.body);
    const { data, error } = await supabase.from("items").insert([{ list_id: listId, text }]).select();
    if (error) return res.status(500).json({ success: false, error: error.message });
    console.log(data);
    return res.json({ success: true, item: data[0] });
  }

  if (req.method === "DELETE") {
    // Delete an item
    const { id } = req.query;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  }

  if (req.method === "PUT") {
    // Toggle item checked status
    const { id, checked } = req.body;
    const { data, error } = await supabase
      .from("items")
      .update({ checked })
      .eq("id", id)
      .select();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, item: data[0] });
  }
}
