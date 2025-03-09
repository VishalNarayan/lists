import { authenticateToken } from "./authMiddleware";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  authenticateToken(req, res, async () => {
    const phone = req.user.phone;

    if (req.method === "GET") {
        const { data, error } = await supabase.from("lists").select("*").eq("user_phone", phone);
        console.log(data);
        if (error) return res.status(500).json({ success: false, error: error.message });
        return res.json({success: true, lists: data || [], message: `Authenticated as ${req.user.phone}`});

    } else if (req.method === "POST") {
        const { phone, name } = req.body;
        console.log(phone, name);
        const { data, error } = await supabase.from("lists").insert([{user_phone: phone, name}]);
        console.log(error);
        if (error) return res.status(500).json({ success: false, error: error.message });
        return res.json({ success: true, list: data });

    } else if (req.method === "DELETE"){
        const { id } = req.query;
        const { error } = await supabase.from("lists").delete().eq("id", id);
        if (error) return res.status(500).json({ success: false, error: error.message });
        return res.json({ success: true });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
  });
}